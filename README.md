# EchoAI

> AI-powered Echocardiogram Enhancement and Left Ventricle Segmentation using Deep Learning.

---

## Project Overview

EchoAI is a deep learning-based clinical application that enhances echocardiogram images and performs automatic left ventricle segmentation using a U-Net model.

The application provides an interactive dashboard where users can upload ultrasound images, visualize AI-generated segmentation masks, and view important cardiac measurements.

This project was developed as a BE Computer Science Engineering Major Project.

---

## Features

- Echocardiogram image enhancement
- Automatic Left Ventricle segmentation
- U-Net deep learning model
- React + Vite frontend
- Flask backend
- Interactive clinical dashboard
- AI Findings panel
- Cardiac measurements
- Report generation
- Upload & image preview
- Professional medical UI

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Flask
- Python

### Deep Learning

- PyTorch
- U-Net

### Dataset

- CAMUS Dataset

---

## Project Structure

```
EchoAI/
│
├── backend/
├── public/
├── src/
├── examples/
├── scratch/
├── convert_nii_to_png.py
├── package.json
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/shak/EchoAI.git
```

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

---

## Dataset

This project uses the CAMUS Echocardiography Dataset.

The dataset is not included in this repository because of its large size.

---

## Model

The pretrained U-Net model is not included because it exceeds GitHub's file size limit.

To use the project:

1. Train the model using `backend/train.py`

OR

2. Place your trained model inside:

```
backend/models/unet_camus.pth
```

---

## Future Improvements

- Multi-chamber segmentation
- DICOM support
- PACS integration
- Real-time inference
- Cloud deployment
- Doctor authentication

---

## License

MIT License
