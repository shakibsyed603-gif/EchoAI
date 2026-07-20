"""
EchoAI - CAMUS Dataset Loader (NIfTI format)
==============================================
Loads echocardiography images and segmentation masks from the CAMUS dataset.

CAMUS Kaggle format:
  - Images: .nii.gz (NIfTI compressed) — loaded via nibabel
  - Masks:  _gt.nii.gz — ground truth segmentation
  - Views:  2CH (2-chamber) and 4CH (4-chamber)
  - Phases: ED (End-Diastole) and ES (End-Systole)
  
Mask classes:
  0 = Background
  1 = Left Ventricle (LV)
  2 = Myocardium (MYO)
  3 = Left Atrium (LA)
"""

import os
import numpy as np
import cv2
import nibabel as nib
from torch.utils.data import Dataset, DataLoader
import torch

# Global cache for NIfTI files to prevent repeated decompression
_NIFTI_CACHE = {}
class CAMUSDataset(Dataset):
    """
    PyTorch Dataset for loading CAMUS echocardiography images and masks.
    
    Args:
        data_dir: Path to 'database_nifti/' folder containing patient directories
        image_size: Target size for resizing (default 256x256)
        augment: Whether to apply data augmentation during training
        views: Which views to include ('2CH', '4CH', or 'both')
        phases: Which cardiac phases to include ('ED', 'ES', or 'both')
    """

    def __init__(self, data_dir, image_size=256, augment=False, 
                 views='both', phases='both'):
        super().__init__()
        self.data_dir = data_dir
        self.image_size = image_size
        self.augment = augment
        self.samples = []

        # Determine which views and phases to load
        view_list = ['2CH', '4CH'] if views == 'both' else [views]
        phase_list = ['ED', 'ES'] if phases == 'both' else [phases]

        # Scan patient directories
        patient_dirs = sorted([
            d for d in os.listdir(data_dir)
            if os.path.isdir(os.path.join(data_dir, d)) and d.startswith('patient')
        ])

        for patient in patient_dirs:
            patient_path = os.path.join(data_dir, patient)
            for view in view_list:
                for phase in phase_list:
                    # Image: patient0001_2CH_ED.nii.gz
                    img_name = f"{patient}_{view}_{phase}.nii.gz"
                    # Mask:  patient0001_2CH_ED_gt.nii.gz
                    mask_name = f"{patient}_{view}_{phase}_gt.nii.gz"

                    img_path = os.path.join(patient_path, img_name)
                    mask_path = os.path.join(patient_path, mask_name)

                    if os.path.exists(img_path) and os.path.exists(mask_path):
                        self.samples.append({
                            'image': img_path,
                            'mask': mask_path,
                            'patient': patient,
                            'view': view,
                            'phase': phase
                        })

        print(f"  Loaded {len(self.samples)} samples from {len(patient_dirs)} patients")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample = self.samples[idx]

        is_debug = (idx == 0 and not hasattr(self, '_debug_printed'))
        if is_debug:
            print(f"[DEBUG] Loading first item. Image: {sample['image']} | Mask: {sample['mask']}")
            self._debug_printed = True

        try:
            if is_debug: print("[DEBUG] Before nib.load(image)")
            
            # Use Cache
            cache_key_img = sample['image']
            if cache_key_img in _NIFTI_CACHE:
                image = _NIFTI_CACHE[cache_key_img].copy()
                if is_debug: print("[DEBUG] Loaded image from cache")
            else:
                img_nii = nib.load(sample['image'])
                if is_debug: print("[DEBUG] After nib.load(image)")
                image = img_nii.get_fdata().astype(np.float32)
                if is_debug: print("[DEBUG] After get_fdata() for image")
                # Handle 3D arrays
                if image.ndim == 3:
                    image = image[:, :, 0]
                _NIFTI_CACHE[cache_key_img] = image.copy()

            if is_debug: print("[DEBUG] Before loading mask")
            
            cache_key_mask = sample['mask']
            if cache_key_mask in _NIFTI_CACHE:
                mask = _NIFTI_CACHE[cache_key_mask].copy()
                if is_debug: print("[DEBUG] Loaded mask from cache")
            else:
                mask_nii = nib.load(sample['mask'])
                if is_debug: print("[DEBUG] After nib.load(mask)")
                mask = mask_nii.get_fdata().astype(np.float32)
                if is_debug: print("[DEBUG] After get_fdata() for mask")
                if mask.ndim == 3:
                    mask = mask[:, :, 0]
                _NIFTI_CACHE[cache_key_mask] = mask.copy()

            if is_debug: print("[DEBUG] After loading mask")

            # ── Preprocessing ──
            # Resize
            image = cv2.resize(image, (self.image_size, self.image_size), 
                              interpolation=cv2.INTER_LINEAR)
            mask = cv2.resize(mask, (self.image_size, self.image_size), 
                             interpolation=cv2.INTER_NEAREST)  # Nearest for masks!

            # Normalize image to [0, 1]
            img_min, img_max = image.min(), image.max()
            if img_max - img_min > 0:
                image = (image - img_min) / (img_max - img_min)
            else:
                image = np.zeros_like(image)

            # CLAHE enhancement
            image_uint8 = (image * 255).astype(np.uint8)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            image_uint8 = clahe.apply(image_uint8)
            image = image_uint8.astype(np.float32) / 255.0

            if is_debug: print("[DEBUG] After image/mask preprocessing")

            # ── Data Augmentation ──
            if self.augment:
                image, mask = self._augment(image, mask)

            # ── Convert to PyTorch tensors ──
            # Image: (1, H, W) — single channel grayscale
            image_tensor = torch.from_numpy(image).unsqueeze(0).float()
            # Mask: (H, W) — class indices (0, 1, 2, 3)
            mask_tensor = torch.from_numpy(mask).long()

            if is_debug: print("[DEBUG] Before returning tensors")
            return image_tensor, mask_tensor
        except Exception as e:
            import traceback
            print(f"\n[ERROR] Failed to load sample {sample['image']}")
            traceback.print_exc()
            raise e

    def _augment(self, image, mask):
        """Simple data augmentation: flip + rotation."""
        # Random horizontal flip
        if np.random.random() > 0.5:
            image = np.fliplr(image).copy()
            mask = np.fliplr(mask).copy()

        # Random vertical flip
        if np.random.random() > 0.5:
            image = np.flipud(image).copy()
            mask = np.flipud(mask).copy()

        # Random rotation (-15 to +15 degrees)
        if np.random.random() > 0.5:
            angle = np.random.uniform(-15, 15)
            h, w = image.shape
            M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
            image = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_LINEAR)
            mask = cv2.warpAffine(mask, M, (w, h), flags=cv2.INTER_NEAREST)

        # Random brightness adjustment
        if np.random.random() > 0.5:
            factor = np.random.uniform(0.8, 1.2)
            image = np.clip(image * factor, 0, 1)

        return image, mask


def get_data_loaders(data_dir, image_size=256, batch_size=8, 
                     val_split=0.2, num_workers=0):
    """
    Create training and validation data loaders.
    
    Args:
        data_dir: Path to CAMUS 'database_nifti/' directory
        image_size: Target image size
        batch_size: Batch size for training
        val_split: Fraction of data for validation (0.2 = 20%)
        num_workers: Number of parallel data loading workers
    
    Returns:
        train_loader, val_loader, dataset_info
    """
    # Create full dataset (without augmentation first, to get count)
    full_dataset = CAMUSDataset(data_dir, image_size=image_size, augment=False)

    # Split into train/val
    total = len(full_dataset)
    val_size = int(total * val_split)
    train_size = total - val_size

    # Use fixed seed for reproducible splits
    generator = torch.Generator().manual_seed(42)
    train_indices, val_indices = torch.utils.data.random_split(
        range(total), [train_size, val_size], generator=generator
    )

    # Create separate datasets with augmentation only for training
    train_dataset = CAMUSDataset(data_dir, image_size=image_size, augment=True)
    val_dataset = CAMUSDataset(data_dir, image_size=image_size, augment=False)

    # Create subset datasets
    train_subset = torch.utils.data.Subset(train_dataset, train_indices.indices)
    val_subset = torch.utils.data.Subset(val_dataset, val_indices.indices)

    # For Windows compatibility, pin_memory without CUDA can sometimes freeze.
    use_pin_memory = torch.cuda.is_available()

    # Create data loaders
    train_loader = DataLoader(
        train_subset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=use_pin_memory
    )

    val_loader = DataLoader(
        val_subset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=use_pin_memory
    )

    dataset_info = {
        'total_samples': total,
        'train_samples': train_size,
        'val_samples': val_size,
        'image_size': image_size,
        'num_classes': 4,
        'classes': ['Background', 'LV', 'Myocardium', 'Left Atrium']
    }

    print(f"\n  Dataset Split:")
    print(f"   Training:   {train_size} samples")
    print(f"   Validation: {val_size} samples")
    print(f"   Image size: {image_size}x{image_size}")
    print(f"   Batch size: {batch_size}")

    return train_loader, val_loader, dataset_info


# ============ QUICK TEST ============
if __name__ == "__main__":
    import sys

    # Path to the CAMUS NIfTI database
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'camus', 'database_nifti')

    if not os.path.exists(data_dir):
        print(f"CAMUS data not found at: {data_dir}")
        print("   Make sure you've extracted the dataset first!")
        sys.exit(1)

    train_loader, val_loader, info = get_data_loaders(data_dir, batch_size=4)

    # Test one batch
    images, masks = next(iter(train_loader))
    print(f"\n  Sample Batch:")
    print(f"   Images: {images.shape} (min={images.min():.2f}, max={images.max():.2f})")
    print(f"   Masks:  {masks.shape} (classes: {torch.unique(masks).tolist()})")
