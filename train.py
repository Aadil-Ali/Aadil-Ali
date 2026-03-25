# 1. Install Dependencies
# !pip install ultralytics roboflow

# 2. Download Dataset (If using Roboflow)
# Note: Uncomment and fill in your API key if you want to use Roboflow to download dataset
"""
from roboflow import Roboflow
rf = Roboflow(api_key="YOUR_API_KEY")
project = rf.workspace("your-workspace").project("question-paper-qc")
dataset = project.version(1).download("yolov8")
dataset_location = f"{dataset.location}/data.yaml"
"""

# Hardcoded data.yaml location if dataset is already local
dataset_location = "datasets/data.yaml"

# 3. Train YOLOv8 Model
from ultralytics import YOLO

def main():
    # Load a lightweight, pre-trained YOLOv8 nano model
    model = YOLO('yolov8n.pt')

    print(f"Starting training on {dataset_location}...")

    # Train the model on your dataset
    results = model.train(
        data=dataset_location,
        epochs=100,
        imgsz=1024, # High resolution needed for dense text
        batch=16,
        device=0, # Use GPU if available
        name='question_detector'
    )

    # 4. Export the trained model weights
    import shutil
    import os

    # Check if we're in colab, adjust paths if needed
    source_weight = 'runs/detect/question_detector/weights/best.pt'
    dest_weight = 'best.pt'

    if os.path.exists(source_weight):
        shutil.copy(source_weight, dest_weight)
        print(f"Model saved as {dest_weight}. Download this file for inference.")
    else:
        print(f"Training completed but could not find best weights at {source_weight}")

if __name__ == "__main__":
    main()
