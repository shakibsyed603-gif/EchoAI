import nibabel as nib
import matplotlib.pyplot as plt
import os

# Path to your CAMUS image
nii_path = r"data/camus/database_nifti/patient0004/patient0003_4CH_ED.nii.gz"

# Load image
img = nib.load(nii_path)
data = img.get_fdata()

print("Image shape:", data.shape)

# If 3D, take the middle slice
if data.ndim == 3:
    image = data[:, :, data.shape[2] // 2]
else:
    image = data

# Normalize
image = (image - image.min()) / (image.max() - image.min())

# Save PNG
output_path ="patient0004_4CH_ED.png"
plt.imsave(output_path, image, cmap="gray")

print(f"✅ Saved PNG: {output_path}")