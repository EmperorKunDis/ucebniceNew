# Technical Specification

## Projekt: AI Rozpoznávač gest "Kámen, Nůžky, Papír"

**Verze:** 1.0
**Datum:** 2025-10-26
**Related:** `Projekt09_PRD.md`
**Status:** ✅ Ready for Implementation

---

## 📐 System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               GRADIO WEB INTERFACE                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ File Upload │  │ Image Display │  │ Results Panel │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│             PYTHON APPLICATION LAYER                         │
│  ┌──────────────────┐       ┌───────────────────┐          │
│  │ Image Preprocessor│───────▶│ Inference Engine │          │
│  └──────────────────┘       └───────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ML MODEL LAYER                            │
│  ┌────────────────────────────────────────────┐             │
│  │   TensorFlow.js Model (from Teachable M.)  │             │
│  │   - Input: 224x224x3 image tensor          │             │
│  │   - Output: [prob_kámen, prob_nůžky,       │             │
│  │             prob_papír]                    │             │
│  └────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 TEACHABLE MACHINE CLOUD                      │
│       (model.json + weights hosted by Google)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack

### Core Dependencies

| Technology       | Version | Purpose                          | License     |
| ---------------- | ------- | -------------------------------- | ----------- |
| **Python**       | >= 3.7  | Runtime environment              | PSF         |
| **Gradio**       | >= 3.0  | Web UI framework                 | Apache 2.0  |
| **TensorFlow**   | >= 2.8  | ML inference engine              | Apache 2.0  |
| **NumPy**        | >= 1.19 | Array operations                 | BSD         |
| **Pillow (PIL)** | >= 8.0  | Image processing                 | PIL License |
| **Requests**     | >= 2.25 | HTTP client (for model download) | Apache 2.0  |

### External Services

| Service                  | Provider | Purpose                  | Cost |
| ------------------------ | -------- | ------------------------ | ---- |
| **Teachable Machine**    | Google   | Model training & hosting | Free |
| **TensorFlow.js Models** | Google   | Pre-trained model format | Free |

### Development Tools (Optional)

- **VS Code** - IDE
- **Git** - Version control
- **Python venv** - Virtual environment

---

## 🏗️ Component Specifications

### Component 1: Teachable Machine Model

**Description:** MobileNet-based image classification model trained via Google's Teachable Machine

**Specifications:**

- **Architecture:** MobileNetV2 (transfer learning)
- **Input Shape:** (224, 224, 3) - RGB image
- **Output Shape:** (3,) - probability distribution over 3 classes
- **Model Size:** ~9 MB
- **Format:** TensorFlow.js (converted to Keras .h5 for Python)

**Training Parameters (in Teachable Machine):**

- Epochs: 50 (default)
- Batch Size: 16 (default)
- Learning Rate: 0.001 (default)

**Expected Performance:**

- Training Time: 2-5 minutes (cloud GPU)
- Inference Time: < 500ms per image (CPU)
- Accuracy: 85-95% (depends on training data quality)

**Data Requirements:**

- **Minimum:** 30 images per class
- **Recommended:** 50-100 images per class
- **Diversity:** Vary hand position, lighting, background

---

### Component 2: Python Preprocessing Pipeline

**Module:** `preprocess_image()`

**Purpose:** Convert uploaded image to model-compatible tensor

**Input:**

```python
image: PIL.Image or numpy.ndarray
# Any size, any format (JPEG, PNG, etc.)
```

**Output:**

```python
tensor: numpy.ndarray
# Shape: (1, 224, 224, 3)
# dtype: float32
# Value range: [0, 1] (normalized)
```

**Processing Steps:**

```python
def preprocess_image(image):
    # 1. Resize to 224x224 (model expected input)
    image = image.resize((224, 224))

    # 2. Convert to numpy array
    image_array = np.array(image)

    # 3. Normalize pixel values from [0, 255] to [0, 1]
    image_array = image_array.astype('float32') / 255.0

    # 4. Add batch dimension (1, 224, 224, 3)
    image_array = np.expand_dims(image_array, axis=0)

    return image_array
```

**Error Handling:**

- **Invalid format:** Raise `ValueError` with user-friendly message
- **Corrupted image:** Fallback to default error image
- **Wrong dimensions:** Auto-resize (no error)

---

### Component 3: Inference Engine

**Module:** `predict_gesture()`

**Purpose:** Run model inference and return prediction

**Input:**

```python
image: PIL.Image
# User-uploaded image (preprocessed internally)
```

**Output:**

```python
{
    "class": str,        # "Kámen" | "Nůžky" | "Papír"
    "confidence": float, # 0.0 - 1.0
    "all_probabilities": {
        "Kámen": float,
        "Nůžky": float,
        "Papír": float
    }
}
```

**Implementation:**

```python
def predict_gesture(image):
    # Preprocess
    processed = preprocess_image(image)

    # Inference
    predictions = model.predict(processed)[0]  # Shape: (3,)

    # Map to class names
    class_names = ["Kámen", "Nůžky", "Papír"]
    predicted_class = class_names[np.argmax(predictions)]
    confidence = float(np.max(predictions))

    # Format output
    return {
        "class": predicted_class,
        "confidence": confidence,
        "all_probabilities": {
            class_names[i]: float(predictions[i])
            for i in range(3)
        }
    }
```

**Performance:**

- **Latency:** < 500ms on CPU
- **Memory:** ~100 MB (model loaded in RAM)

---

### Component 4: Gradio Web Interface

**Module:** `gradio.Interface()`

**Purpose:** Provide web UI for image upload and result display

**Configuration:**

```python
interface = gr.Interface(
    fn=predict,                        # Inference function
    inputs=gr.Image(type="pil"),       # Image upload widget
    outputs=[
        gr.Label(num_top_classes=3),   # Top 3 predictions with bars
        gr.Text()                       # Additional info
    ],
    title="🎮 AI Rozpoznávač: Kámen, Nůžky, Papír",
    description="Nahrajte obrázek vaší ruky...",
    examples=[
        ["examples/rock.jpg"],
        ["examples/scissors.jpg"],
        ["examples/paper.jpg"]
    ],
    theme="default",
    live=False                         # Process on submit, not live
)
```

**UI Elements:**

1. **Input Panel:**
   - Drag-and-drop zone
   - File picker button
   - Webcam capture (optional, v2.0)

2. **Output Panel:**
   - Primary prediction (large text)
   - Confidence bar (visual progress bar)
   - All class probabilities (bar chart)

3. **Examples:**
   - 3 pre-loaded example images
   - One-click testing

**Accessibility:**

- Keyboard navigation (Tab, Enter)
- Screen reader compatible (via Gradio defaults)
- Mobile responsive (auto-resize)

---

## 🔄 Data Flow Diagram

### Detailed Request Flow

```
[1] User uploads image
        │
        ▼
[2] Gradio receives PIL.Image object
        │
        ▼
[3] predict() function called
        │
        ├─▶ [4] preprocess_image()
        │        └─▶ Resize to 224x224
        │        └─▶ Normalize to [0,1]
        │        └─▶ Add batch dimension
        │
        ├─▶ [5] model.predict()
        │        └─▶ Forward pass through MobileNet
        │        └─▶ Return (3,) probability array
        │
        └─▶ [6] Post-processing
                 └─▶ argmax for predicted class
                 └─▶ Format as dict
        │
        ▼
[7] Gradio renders results
        └─▶ Label widget (bar chart)
        └─▶ Text widget (JSON details)
```

**Timing Breakdown (CPU):**

- [1-2] Upload: < 100ms (network dependent)
- [3-4] Preprocessing: ~50ms
- [5] Inference: ~300-400ms
- [6] Post-processing: ~10ms
- [7] Rendering: ~50ms
- **Total:** ~500-600ms

---

## 🗃️ Data Specifications

### Training Data (Teachable Machine)

**Format:**

- **Type:** Images (JPEG/PNG)
- **Source:** Webcam capture via Teachable Machine
- **Labels:** Manual (user assigns to class)

**Structure:**

```
Teachable Machine Project/
├── Class: Kámen/
│   ├── sample_001.jpg
│   ├── sample_002.jpg
│   └── ... (30-100 images)
├── Class: Nůžky/
│   └── ... (30-100 images)
└── Class: Papír/
    └── ... (30-100 images)
```

**Quality Guidelines:**

- **Resolution:** Ideally > 224x224 (auto-downsized)
- **Lighting:** Variety (bright, dim, natural, artificial)
- **Background:** Variety (reduces overfitting to one environment)
- **Hand Position:** Different angles, distances

### Model Files

**Downloaded from Teachable Machine:**

1. **model.json** (~10 KB)
   - Model architecture definition
   - TensorFlow.js format

2. **weights.bin** (~9 MB)
   - Trained weights
   - Binary format

3. **labels.txt** (<< 1 KB)
   ```
   0 Kámen
   1 Nůžky
   2 Papír
   ```

**Conversion for Python:**

```bash
# TensorFlow.js → Keras .h5 (handled by tf.keras.utils.get_file)
MODEL_URL = "https://teachablemachine.withgoogle.com/models/YOUR_ID/"
model = tf.keras.models.load_model(MODEL_URL + "model.json")
```

---

## 🔐 Security Considerations

### Threat Model

**Low Risk** - This is an educational project with minimal attack surface

**Potential Threats:**

1. **Malicious image upload** → DoS via huge file
2. **Model poisoning** → N/A (model trained by user, not adversarial)
3. **Code injection** → N/A (no user code execution)

### Mitigations

| Threat               | Mitigation                          | Status      |
| -------------------- | ----------------------------------- | ----------- |
| Large file upload    | Gradio auto-limits to 10 MB         | ✅ Default  |
| Invalid image format | Pillow handles gracefully           | ✅ Built-in |
| Network attacks      | Localhost only (no public exposure) | ✅ Default  |

**Recommendations:**

- **DON'T** deploy to public internet without auth
- **DON'T** use for sensitive/biometric data
- **DO** run in virtual environment (dependency isolation)

---

## ⚡ Performance Optimization

### Current Baseline

- **Cold start:** ~5 seconds (model load)
- **Warm inference:** ~500ms per image
- **Memory usage:** ~150 MB

### Optimization Opportunities

**v1.0 (MVP) - No optimization needed**

- Current performance meets requirements (< 2s)

**v1.1 (Optional improvements):**

1. **Model Quantization:**

   ```python
   # Convert float32 → int8 (4x smaller, faster)
   converter = tf.lite.TFLiteConverter.from_keras_model(model)
   converter.optimizations = [tf.lite.Optimize.DEFAULT]
   tflite_model = converter.convert()
   ```

   - **Benefit:** 2-3x faster inference, 4x smaller model
   - **Trade-off:** ~1-2% accuracy loss

2. **Batch Processing:**
   - Currently: 1 image at a time
   - Future: Process multiple images (if needed for video stream)

3. **Caching:**
   - Cache model in memory (already done)
   - Cache common images (overkill for this use case)

---

## 🧪 Testing Strategy

### Unit Tests

**Test 1: Image Preprocessing**

```python
def test_preprocess_image():
    # Given: 500x500 RGB image
    test_image = Image.new('RGB', (500, 500), color='red')

    # When: Preprocess
    result = preprocess_image(test_image)

    # Then: Correct shape and range
    assert result.shape == (1, 224, 224, 3)
    assert 0 <= result.min() <= 1
    assert 0 <= result.max() <= 1
```

**Test 2: Model Loading**

```python
def test_model_loads():
    # Given: Valid model URL
    url = "https://teachablemachine.withgoogle.com/models/VALID_ID/"

    # When: Load model
    model = load_model(url)

    # Then: Model is callable
    assert callable(model.predict)
    assert model.input_shape == (None, 224, 224, 3)
```

### Integration Tests

**Test 3: End-to-End Inference**

```python
def test_predict_rock_gesture():
    # Given: Known "rock" image
    test_image = Image.open("test_data/rock_01.jpg")

    # When: Run prediction
    result = predict_gesture(test_image)

    # Then: Predicts "Kámen" with high confidence
    assert result["class"] == "Kámen"
    assert result["confidence"] > 0.7
```

**Test 4: Gradio Interface**

```python
def test_gradio_interface():
    # Given: Interface instantiated
    interface = create_interface()

    # When: Process test image
    output = interface("test_data/scissors_01.jpg")

    # Then: Returns valid output
    assert "Nůžky" in str(output)
```

### Manual QA Checklist

- [ ] Upload každého typu gesta (kámen, nůžky, papír)
- [ ] Upload neplatného formátu (např. PDF)
- [ ] Upload velmi malého obrázku (10x10)
- [ ] Upload velmi velkého obrázku (5000x5000)
- [ ] Test na různých prohlížečích (Chrome, Firefox, Safari)
- [ ] Test na mobilu (iOS, Android)

---

## 🐛 Error Handling

### Error Categories

**1. User Input Errors**

| Error               | Cause                | Handling                                   |
| ------------------- | -------------------- | ------------------------------------------ |
| Invalid file format | User uploads PDF/TXT | Show: "Prosím nahrajte obrázek (JPG/PNG)"  |
| Corrupted image     | Damaged file         | Show: "Obrázek nelze načíst. Zkuste jiný." |
| Empty upload        | No file selected     | Disable submit until file present          |

**2. Model Errors**

| Error             | Cause                      | Handling                                               |
| ----------------- | -------------------------- | ------------------------------------------------------ |
| Model not loaded  | Network error, invalid URL | Show: "Chyba načítání modelu. Zkontrolujte MODEL_URL." |
| Inference failure | Out of memory              | Show: "Zpracování se nezdařilo. Zkuste menší obrázek." |

**3. System Errors**

| Error              | Cause              | Handling                                                     |
| ------------------ | ------------------ | ------------------------------------------------------------ |
| Dependency missing | pip install failed | Clear error: "Nainstalujte: pip install -r requirements.txt" |
| Python version     | Python < 3.7       | Show: "Vyžadován Python 3.7+"                                |

### Error Response Format

```python
{
    "error": True,
    "message": "Uživatelsky přívětivá zpráva",
    "details": "Technické detaily (pro debugging)",
    "suggestion": "Co udělat (např. 'Nahrajte PNG nebo JPG')"
}
```

---

## 📦 Deployment

### Local Deployment (Default)

**Requirements:**

- Python 3.7+
- 200 MB free disk space (dependencies)
- Internet connection (first run for model download)

**Steps:**

```bash
# 1. Clone/download project
git clone https://github.com/YOUR_REPO/rock-paper-scissors-ai.git
cd rock-paper-scissors-ai

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run application
python app.py

# 5. Open browser
# http://localhost:7860
```

**Configuration:**

- Edit `MODEL_URL` in `app.py` with your Teachable Machine URL
- Optional: Change port in `interface.launch(server_port=7860)`

### Cloud Deployment (Optional, not in scope for v1.0)

**Hugging Face Spaces:**

1. Create `README.md` with Space metadata
2. Push to HF repo
3. Auto-deployment
4. URL: `https://huggingface.co/spaces/YOUR_USERNAME/APP_NAME`

**Gradio Share (Quick demo):**

```python
interface.launch(share=True)  # Generates public link (72 hr expiry)
```

---

## 📁 Project Structure

```
rock-paper-scissors-ai/
├── app.py                      # Main application
├── requirements.txt            # Python dependencies
├── README.md                   # Quick start guide (Projekt09_README.md)
├── Projekt09_PRD.md           # Product requirements
├── Projekt09_TechSpec.md      # This document
├── examples/                   # Example images for Gradio
│   ├── rock.jpg
│   ├── scissors.jpg
│   └── paper.jpg
├── test_data/                  # Test images (optional)
│   └── ...
└── tm_model/                   # Downloaded model (auto-created)
    ├── keras_model.h5
    └── labels.txt
```

---

## 🔗 API Reference

### Main Functions

#### `load_model(model_url: str) -> tf.keras.Model`

Loads TensorFlow model from Teachable Machine URL.

**Parameters:**

- `model_url` (str): Base URL from Teachable Machine export

**Returns:**

- `tf.keras.Model`: Loaded model ready for inference

**Raises:**

- `ValueError`: If URL is invalid or model not found

---

#### `preprocess_image(image: PIL.Image) -> np.ndarray`

Converts PIL Image to model-compatible tensor.

**Parameters:**

- `image` (PIL.Image): Input image (any size)

**Returns:**

- `np.ndarray`: Shape (1, 224, 224, 3), normalized [0, 1]

---

#### `predict(image: PIL.Image) -> Tuple[Dict, str]`

Main prediction function (Gradio interface).

**Parameters:**

- `image` (PIL.Image): User-uploaded image

**Returns:**

- `Tuple[Dict, str]`:
  - Dict: `{class_name: probability}`
  - str: JSON string with details

---

## 📊 Monitoring & Logging

### Logging Strategy

**Log Levels:**

- **INFO:** Model loaded, prediction made
- **WARNING:** Low confidence prediction (< 0.5)
- **ERROR:** Model loading failed, inference error

**Example Log Output:**

```
INFO: Model loaded from https://teachablemachine.withgoogle.com/models/abc123/
INFO: Prediction made: Kámen (confidence: 0.92)
WARNING: Low confidence prediction: Nůžky (confidence: 0.45)
ERROR: Failed to load model: Connection timeout
```

**Configuration:**

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()  # Also print to console
    ]
)
```

---

## 🔄 Version Control & CI/CD

**Version Control:**

- Git + GitHub
- Branch strategy: `main` (stable), `dev` (development)

**CI/CD (Future):**

- GitHub Actions for automated testing
- Auto-deploy to Hugging Face Spaces on merge to `main`

**Versioning:**

- Semantic versioning: `MAJOR.MINOR.PATCH`
- v1.0.0: Initial release
- v1.1.0: Add webcam support
- v2.0.0: Custom model training

---

## 📚 Dependencies Deep Dive

### Gradio (>= 3.0)

**Why:**

- Zero frontend code required
- Auto-generates beautiful UI
- Mobile-responsive
- Built-in share functionality

**Alternatives Considered:**

- Flask: Too much boilerplate
- Streamlit: Less suitable for ML demos
- FastAPI: Overkill for simple project

**Known Issues:**

- v4.0 has breaking changes → pin to v3.x

---

### TensorFlow (>= 2.8)

**Why:**

- Required for loading Keras models
- Mature, well-documented
- Compatible with Teachable Machine output

**Alternatives Considered:**

- PyTorch: Teachable Machine doesn't export to PyTorch
- ONNX: Additional conversion step

**Known Issues:**

- Large installation size (~500 MB)
- Consider `tensorflow-cpu` for smaller size if no GPU

---

## 🎓 Learning Objectives (Technical)

After implementing this project, student should understand:

1. **ML Pipeline:**
   - Data collection → Training → Deployment
   - Difference between training and inference

2. **Model Architecture:**
   - Transfer learning (MobileNet base)
   - Input/output shapes
   - Softmax activation for multi-class

3. **Image Processing:**
   - Resizing, normalization
   - Why preprocessing matters

4. **Web Deployment:**
   - Backend (Python) vs Frontend (Gradio auto-gen)
   - Request/response cycle

---

## 🔧 Troubleshooting Guide (Technical)

**Issue:** Model loading fails with `OSError`

- **Cause:** Invalid MODEL_URL or network issue
- **Fix:** Verify URL, check internet connection

**Issue:** Predictions always return same class

- **Cause:** Poor training data (overfitting to one class)
- **Fix:** Retrain with more diverse data

**Issue:** `ModuleNotFoundError: No module named 'gradio'`

- **Cause:** Dependencies not installed
- **Fix:** Run `pip install -r requirements.txt`

**Issue:** Port 7860 already in use

- **Cause:** Another Gradio app running
- **Fix:** Change port: `interface.launch(server_port=7861)`

---

## 📝 Change Log

| Version | Date       | Changes                         | Author    |
| ------- | ---------- | ------------------------------- | --------- |
| 1.0     | 2025-10-26 | Initial technical specification | Claude AI |

---

## ✅ Technical Review Checklist

- [x] Architecture diagram provided
- [x] All components specified
- [x] Data flow documented
- [x] Error handling defined
- [x] Testing strategy outlined
- [x] Performance benchmarks set
- [x] Security considered
- [x] Dependencies justified

---

**Konec dokumentu**

_Ready for implementation. Proceed to coding phase._
