import os
import zipfile
import tempfile
import cv2
import fitz  # PyMuPDF
import numpy as np
import pandas as pd
from PIL import Image
from ultralytics import YOLO
from skimage.metrics import structural_similarity as ssim
import streamlit as st
import io

# ==========================================
# 1. INFERENCE & SMART CROPPING (2-COLUMN)
# ==========================================

def sort_bboxes_2_column(bboxes, page_width):
    """
    Optimization: Handles 2-column PDFs correctly.
    Sorts boxes: Left column first (top-to-bottom), then Right column (top-to-bottom).
    """
    left_col = []
    right_col = []
    mid_x = page_width / 2

    for bbox in bboxes:
        x1, y1, x2, y2, conf, cls = bbox
        center_x = (x1 + x2) / 2
        # Assign to left or right column
        if center_x < mid_x:
            left_col.append(bbox)
        else:
            right_col.append(bbox)

    # Sort each column vertically (top-to-bottom using y1)
    left_col = sorted(left_col, key=lambda b: b[1])
    right_col = sorted(right_col, key=lambda b: b[1])

    return left_col + right_col

def extract_questions_from_pdf(pdf_path, model, output_dir, conf_threshold=0.5):
    """Detects question blocks, sorts them, and crops them into images."""
    doc = fitz.open(pdf_path)
    cropped_paths = []
    question_idx = 1

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(dpi=200) # Render at 200 DPI for clarity
        img_array = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)

        # Convert to RGB for YOLO
        if pix.n == 4:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGBA2RGB)
        elif pix.n == 1:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2RGB)

        # Run YOLOv8 inference
        results = model.predict(img_array, conf=conf_threshold, verbose=False)

        bboxes = []
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = box.conf[0].item()
                cls = int(box.cls[0].item())
                bboxes.append((x1, y1, x2, y2, conf, cls))

        # Apply 2-column sorting
        sorted_bboxes = sort_bboxes_2_column(bboxes, pix.w)

        for bbox in sorted_bboxes:
            x1, y1, x2, y2, conf, cls = bbox

            # Add a small padding to bounding boxes (optimization)
            pad = 5
            y1_p, y2_p = max(0, int(y1)-pad), min(pix.h, int(y2)+pad)
            x1_p, x2_p = max(0, int(x1)-pad), min(pix.w, int(x2)+pad)

            crop_img = img_array[y1_p:y2_p, x1_p:x2_p]
            crop_img_bgr = cv2.cvtColor(crop_img, cv2.COLOR_RGB2BGR)

            crop_filename = f"PDF_Q{question_idx:03d}.png"
            crop_path = os.path.join(output_dir, crop_filename)
            cv2.imwrite(crop_path, crop_img_bgr)

            cropped_paths.append({
                'q_num': f"Q{question_idx:03d}",
                'path': crop_path,
                'page': page_num + 1,
                'conf': conf
            })
            question_idx += 1

    return cropped_paths

# ==========================================
# 2. IMAGE MATCHING (SSIM + ORB)
# ==========================================

def compare_images(img1_path, img2_path):
    """
    Compares two crops. Uses SSIM (Structural Similarity) and ORB feature matching
    to evaluate mathematical symbols, diagrams, and text without OCR.
    """
    img1 = cv2.imread(img1_path, cv2.IMREAD_GRAYSCALE)
    img2 = cv2.imread(img2_path, cv2.IMREAD_GRAYSCALE)

    if img1 is None or img2 is None:
        return 0.0

    # Resize img2 to match img1 dimensions exactly for SSIM
    h, w = img1.shape
    img2_resized = cv2.resize(img2, (w, h))

    # Calculate SSIM (focuses on structural layout and density)
    ssim_score, _ = ssim(img1, img2_resized, full=True)

    # Calculate ORB matches (focuses on distinct features/keypoints)
    orb = cv2.ORB_create()
    kp1, des1 = orb.detectAndCompute(img1, None)
    kp2, des2 = orb.detectAndCompute(img2_resized, None)

    orb_score = 0.0
    if des1 is not None and des2 is not None:
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = bf.match(des1, des2)
        if len(kp1) > 0:
            orb_score = min(len(matches) / (len(kp1) * 0.5), 1.0)

    # Blended scoring mechanism
    final_score = (max(ssim_score, 0) * 0.7 + orb_score * 0.3) * 100
    return final_score

# ==========================================
# 3. CORE PIPELINE & ERROR HANDLING
# ==========================================

import shutil

def process_qc_pipeline(pdf_path, zip_path, model_path):
    temp_dir = tempfile.mkdtemp()
    try:
        pdf_crops_dir = os.path.join(temp_dir, "pdf_crops")
        zip_extract_dir = os.path.join(temp_dir, "zip_images")
        os.makedirs(pdf_crops_dir, exist_ok=True)
        os.makedirs(zip_extract_dir, exist_ok=True)

        # 1. Extract ZIP
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(zip_extract_dir)

        # Map extracted ZIP images
        zip_images = {}
        for root, dirs, files in os.walk(zip_extract_dir):
            for f in files:
                if f.upper().startswith("Q") and f.lower().endswith(('.png', '.jpg', '.jpeg')):
                    q_key = os.path.splitext(f)[0].upper() # Extracts 'Q001'
                    zip_images[q_key] = os.path.join(root, f)

        # 2. Extract PDF Crops via YOLO
        model = YOLO(model_path)
        pdf_crops = extract_questions_from_pdf(pdf_path, model, pdf_crops_dir)

        # 3. Match and Build Report (Handles Missing / Sequence Errors)
        results = []
        all_q_keys = set([c['q_num'] for c in pdf_crops] + list(zip_images.keys()))
        all_q_keys = sorted(list(all_q_keys)) # Ensures correct sequence

        for q_key in all_q_keys:
            pdf_crop_info = next((c for c in pdf_crops if c['q_num'] == q_key), None)
            zip_img_path = zip_images.get(q_key)

            score = 0.0
            pdf_crop_name = os.path.basename(pdf_crop_info['path']) if pdf_crop_info else "N/A"
            zip_img_name = os.path.basename(zip_img_path) if zip_img_path else "N/A"

            # Error Handling Logic
            if pdf_crop_info and zip_img_path:
                score = compare_images(pdf_crop_info['path'], zip_img_path)
                if score >= 80.0:
                    status = "✅ MATCH"
                elif score >= 50.0:
                    status = "⚠️ LOW CONFIDENCE MATCH"
                else:
                    status = "❌ MISMATCH"
            elif not pdf_crop_info:
                status = "❌ MISSING IN PDF (Extra in ZIP)"
            elif not zip_img_path:
                status = "❌ MISSING IN ZIP (Not Provided)"

            results.append({
                "Question Number": q_key,
                "PDF File Crop": pdf_crop_name,
                "ZIP File Image": zip_img_name,
                "Similarity (%)": round(score, 2),
                "Status": status,
                "Detection Conf": round(pdf_crop_info['conf'], 2) if pdf_crop_info else 0.0,
                "PDF Page": pdf_crop_info['page'] if pdf_crop_info else "N/A"
            })

        return pd.DataFrame(results)
    finally:
        # Ensure temporary directory is removed after processing
        shutil.rmtree(temp_dir, ignore_errors=True)

# ==========================================
# 4. STREAMLIT USER INTERFACE
# ==========================================

st.set_page_config(page_title="AI QC Tool", layout="wide")
st.title("📄 AI-Powered Question Paper QC Tool")
st.markdown("Upload the Exam PDF, the ZIP containing raw image crops, and your trained YOLOv8 weights.")

col1, col2, col3 = st.columns(3)
with col1:
    pdf_file = st.file_uploader("1. Upload Exam PDF", type=['pdf'])
with col2:
    zip_file = st.file_uploader("2. Upload ZIP (Q001.png...)", type=['zip'])
with col3:
    model_file = st.file_uploader("3. Upload YOLO Weights (.pt)", type=['pt'])

if st.button("🚀 Run QC Analysis", use_container_width=True):
    if pdf_file and zip_file and model_file:
        with st.spinner("Processing PDF, running ML inference, and matching images..."):

            # Save uploads to temp
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
                tmp_pdf.write(pdf_file.read())
                tmp_pdf_path = tmp_pdf.name

            with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as tmp_zip:
                tmp_zip.write(zip_file.read())
                tmp_zip_path = tmp_zip.name

            with tempfile.NamedTemporaryFile(delete=False, suffix=".pt") as tmp_pt:
                tmp_pt.write(model_file.read())
                tmp_pt_path = tmp_pt.name

            # Execute Pipeline
            try:
                report_df = process_qc_pipeline(tmp_pdf_path, tmp_zip_path, tmp_pt_path)

                # Render Report
                st.success("Analysis Complete!")
                st.dataframe(report_df, height=400)

                # Export options
                csv = report_df.to_csv(index=False).encode('utf-8')

                excel_buffer = io.BytesIO()
                with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
                    report_df.to_excel(writer, index=False, sheet_name='QC_Report')
                excel_data = excel_buffer.getvalue()

                col1, col2 = st.columns(2)
                col1.download_button("📥 Download Report (CSV)", data=csv, file_name="QC_Report.csv", mime="text/csv")
                col2.download_button("📥 Download Report (Excel)", data=excel_data, file_name="QC_Report.xlsx", mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

            except Exception as e:
                st.error(f"An error occurred during processing: {e}")
            finally:
                # Clean up uploaded temporary files
                for tmp_file_path in [tmp_pdf_path, tmp_zip_path, tmp_pt_path]:
                    try:
                        os.remove(tmp_file_path)
                    except OSError:
                        pass
    else:
        st.warning("Please upload all three required files (PDF, ZIP, Model Weights).")
