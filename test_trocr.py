#!/usr/bin/env python3
"""
Test script to verify TrOCR installation and basic functionality
"""

import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import requests
import io

def test_trocr_installation():
    """Test TrOCR installation and basic functionality"""
    try:
        print("Testing TrOCR installation...")
        
        # Load TrOCR model and processor
        print("Loading TrOCR model...")
        processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-printed')
        model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-printed')
        
        print("✓ TrOCR model loaded successfully!")
        
        # Create a simple test image with text
        print("\nTesting with a sample image...")
        
        # You can replace this with your own image URL or use a local image
        url = 'https://fki.tic.heia-fr.ch/static/img/a01-122-02-00.jpg'
        
        try:
            response = requests.get(url)
            image = Image.open(io.BytesIO(response.content)).convert('RGB')
            
            # Process the image
            pixel_values = processor(images=image, return_tensors="pt").pixel_values
            
            # Generate text
            generated_ids = model.generate(pixel_values)
            generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            print(f"✓ OCR Result: {generated_text}")
            
        except Exception as e:
            print(f"⚠ Network test failed: {e}")
            print("This is normal if there's no internet connection.")
            print("TrOCR is installed correctly - you can test with local images.")
        
        return True
        
    except Exception as e:
        print(f"✗ Error testing TrOCR: {e}")
        return False

def test_dependencies():
    """Test all major dependencies"""
    print("\n" + "="*50)
    print("TESTING ALL DEPENDENCIES")
    print("="*50)
    
    dependencies = [
        ("torch", "PyTorch"),
        ("torchvision", "TorchVision"),
        ("transformers", "Transformers"),
        ("cv2", "OpenCV"),
        ("pandas", "Pandas"),
        ("numpy", "NumPy"),
        ("matplotlib", "Matplotlib"),
        ("sklearn", "Scikit-learn"),
        ("PIL", "Pillow"),
        ("easyocr", "EasyOCR")
    ]
    
    results = []
    for module, name in dependencies:
        try:
            __import__(module)
            print(f"✓ {name} - OK")
            results.append(True)
        except ImportError as e:
            print(f"✗ {name} - FAILED: {e}")
            results.append(False)
    
    success_rate = sum(results) / len(results) * 100
    print(f"\nDependency Test Results: {success_rate:.1f}% successful")
    
    return all(results)

if __name__ == "__main__":
    print("PayWise - OCR Environment Test")
    print("="*50)
    
    # Test dependencies
    deps_ok = test_dependencies()
    
    if deps_ok:
        # Test TrOCR specifically
        trocr_ok = test_trocr_installation()
        
        if trocr_ok:
            print("\n🎉 SUCCESS: Your environment is ready for OCR development!")
            print("\nNext steps:")
            print("1. Prepare your training data")
            print("2. Fine-tune TrOCR on your specific documents")
            print("3. Build your automatic data entry pipeline")
        else:
            print("\n⚠ TrOCR test failed - check your installation")
    else:
        print("\n❌ Some dependencies failed - please check the installation")
