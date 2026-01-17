---
title: "Module 1: Foundations of Node-Based AI & ComfyUI Setup"
description: "Introduction to the 'Lego Block' Philosophy and setting up your local ComfyUI environment"
module: "1"
order: 1
---

# Module 1: Foundations of Node-Based AI & ComfyUI Setup

**Duration:** Week 1-2  
**Learning Objectives:**
- Understand the node-based interface philosophy
- Set up ComfyUI in your local environment
- Master the five core nodes for image generation
- Learn model management and organization

---

## 1.1 Introduction to the "Lego Block" Philosophy

ComfyUI is designed around a modular philosophy where users manage and create workflows by visually connecting different tasks, a process frequently compared to **building with Lego blocks**. Understanding this system requires grasping three core components:

### Nodes (Functional Blocks)

These are the rectangular windows within the interface, each representing a **specific function**, such as loading an AI model, entering a text prompt, or saving the final result. Each node has inputs (data coming in) and outputs (data going out), allowing you to chain operations together.

**Examples:**
- Load Checkpoint (loads AI models)
- CLIP Text Encode (processes text prompts)
- KSampler (generates images)
- VAE Decode (converts latent to pixels)
- Save Image (saves the final result)

### Links (Data Pipes)

These are the visible lines connecting nodes, acting as "piping" that dictates exactly **how information moves** from one part of the project to the next. Links ensure type-safe connections and make the data flow visually apparent.

**Characteristics:**
- Visual representation of data flow
- Type-safe connections ensure compatibility
- Clear indication of processing order
- Easy to trace data through the workflow

### Workflows

A workflow is the **visual representation** of the entire image creation process from start to finish. One of the platform's primary advantages is that these workflows can be easily shared or saved as JSON files, making collaboration and reuse simple.

**Benefits:**
- Visual clarity of the entire pipeline
- Easy to save and share
- Can be embedded directly in generated images
- Enables complex multi-stage processes

---

## 1.2 Local Environment Configuration

To run ComfyUI effectively on your own hardware, specific system requirements and installation steps must be followed.

### System Requirements

**GPU:**
- For optimal performance, **Nvidia RTX series cards** are highly preferred due to their superior generation speeds compared to CPUs or other brands.
- CUDA acceleration enables faster inference
- Tensor cores optimize AI operations
- Better memory management for large models

**VRAM:**
- While the system can function on **6GB of VRAM**, at least **8GB of VRAM or more** is recommended for a smooth and fast experience.
- More VRAM allows for larger image sizes and batch processing
- Reduces the need for model swapping

**System RAM:**
- A minimum of **16GB of RAM** is recommended to ensure the workflow runs without bottlenecks.
- Additional RAM helps with model loading and caching
- Prevents system slowdowns during generation

**Storage:**
- 50GB+ free space recommended for models and checkpoints
- Models can range from 2GB to 7GB each
- Additional space needed for generated images and workflows

### Installation Procedures

#### Windows (Portable Version - Recommended)

The most straightforward method is downloading the **portable version**, which integrates an independent Python environment.

**Steps:**
1. Download the portable ComfyUI release from GitHub
2. Extract the archive using tools like 7-Zip or WinRAR to a folder (e.g., `C:\ComfyUI`)
3. Launch the interface via the `run_nvidia_gpu.bat` file
4. The portable version includes all necessary dependencies

**Advantages:**
- No Python installation required
- Isolated environment
- Easy to update or remove
- No system-wide changes

#### macOS

**For Apple Silicon (ARM):**
- Use the standalone installer specifically designed for Apple Silicon/ARM
- Follow the installation wizard
- Launch from Applications folder

**For Intel Macs:**
1. Install Python 3.10+ via Homebrew: `brew install python@3.10`
2. Clone ComfyUI repository: `git clone https://github.com/comfyanonymous/ComfyUI.git`
3. Navigate to directory: `cd ComfyUI`
4. Install dependencies: `pip install -r requirements.txt`
5. Launch: `python main.py`

#### Linux

Linux users typically follow a manual installation guide to set up the necessary dependencies:

1. Install Python and dependencies:
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip python3-venv git
   ```
2. Create virtual environment: `python3 -m venv venv`
3. Activate: `source venv/bin/activate`
4. Clone ComfyUI: `git clone https://github.com/comfyanonymous/ComfyUI.git`
5. Navigate: `cd ComfyUI`
6. Install dependencies: `pip install -r requirements.txt`
7. Launch: `python main.py`

---

## 1.3 First Generation & The Core Workflow

A standard "text-to-image" workflow in ComfyUI relies on **five foundational nodes** that must be linked in a specific sequence to produce an image.

### The Five Foundational Nodes

#### 1. Load Checkpoint

This node is used to select and load your chosen Stable Diffusion model.

- **Purpose:** Loads the Stable Diffusion model
- **Inputs:** Model file path (selected from dropdown)
- **Outputs:** Model, CLIP, VAE
- **Location:** Models stored in `<ComfyUI_folder>/models/checkpoints`
- **Usage:** First node in the workflow, provides model data to other nodes

#### 2. CLIP Text Encode

This usually requires **two nodes**—one for the **Positive Prompt** (describing what you want to see) and one for the **Negative Prompt** (describing elements to avoid).

**Positive Prompt Node:**
- **Purpose:** Encodes your prompt into the model's language space
- **Inputs:** Text prompt, CLIP model (from Load Checkpoint)
- **Outputs:** Positive conditioning
- **Best Practice:** Be specific and descriptive about desired elements

**Negative Prompt Node:**
- **Purpose:** Encodes what you want to avoid
- **Inputs:** Negative prompt text, CLIP model (from Load Checkpoint)
- **Outputs:** Negative conditioning
- **Common Use:** Remove artifacts, improve quality, exclude unwanted elements

#### 3. KSampler

The "brain" of the generation, which takes the encoded prompts and applies settings like **seed, steps, and CFG** to generate a result in latent space.

- **Purpose:** The actual generation step
- **Inputs:** 
  - Model (from Load Checkpoint)
  - Positive conditioning (from CLIP Text Encode)
  - Negative conditioning (from CLIP Text Encode)
  - Seed (random number for reproducibility)
  - Steps (number of denoising iterations)
  - CFG Scale (how closely to follow the prompt)
- **Outputs:** Latent image representation
- **Key Parameters:**
  - **Steps:** 20-50 (more = better quality, slower generation)
  - **CFG Scale:** 7-12 (higher = more prompt adherence, but can reduce quality if too high)
  - **Seed:** Random number or fixed value for reproducibility

#### 4. VAE Decode

This node is critical for **translating compressed latent data** into a viewable image.

- **Purpose:** Converts latent space to pixel space
- **Inputs:** Latent image (from KSampler), VAE model (from Load Checkpoint)
- **Outputs:** Final image in pixel format
- **Note:** VAE comes with the checkpoint, but can be swapped for different VAE models

#### 5. Save Image

The final step which renders and displays the finished imagery on the canvas.

- **Purpose:** Writes the final image to disk and displays it
- **Inputs:** Image (from VAE Decode), filename prefix (optional)
- **Outputs:** Saved file path, displayed image on canvas
- **Location:** Images saved to `ComfyUI/output` folder by default

### Understanding Latent vs. Pixel Space

**Latent Space:**
- AI models primarily operate in **latent space**, a mathematical, compressed representation of an image that is invisible to the human eye
- Compressed representation (e.g., 512x512 image → 64x64 latent)
- Smaller memory footprint
- Where the AI model actually performs generation
- Faster processing

**Pixel Space:**
- The **pixel space** is the viewable imagery that we see in the final output
- Final image pixels (RGB values)
- What humans can see and understand
- Larger memory footprint
- Final output format

**The Bridge:**
The **VAE Decode** node serves as the bridge, converting this mathematical data back into the **pixel space** (viewable imagery) that we see in the final output.

**The Complete Workflow:**
```
Text Prompt → CLIP Encoding → Latent Space (KSampler Generation) → VAE Decode → Pixel Space (Final Image)
```

---

## 1.4 Model Management

To generate high-quality results, you must manually manage your models (also known as checkpoints).

### Downloading Models

**Primary Source: CivitAI**
- The community platform **CivitAI** is the preferred resource for finding models
- Visit [civitai.com](https://civitai.com)
- Browse by category (Checkpoint, LoRA, VAE, ControlNet, etc.)
- Filter by popularity, rating, and tags

**Preferred File Format:**
- When downloading, the **.safetensors** format is highly preferred over the older `.ckpt` format because it is **safer and more secure**
- `.safetensors` files prevent arbitrary code execution
- Better security for model sharing
- Supported by all modern Stable Diffusion interfaces

**Model Types:**
- **Checkpoints:** Full models (2-7GB) - Complete Stable Diffusion models
- **LoRA:** Lightweight adapters (10-200MB) - Style or character modifications
- **VAE:** Visual Autoencoders for better color/quality
- **ControlNet:** Structural guidance models for precise control

### Organizing Folders

**Required Directory Structure:**
Downloaded model files must be placed in the correct directory to be recognised:

```
<ComfyUI_folder>/models/checkpoints/
```

**Complete Folder Structure:**
```
ComfyUI/
├── models/
│   ├── checkpoints/        # Main models (.safetensors or .ckpt files)
│   ├── loras/              # LoRA adapters
│   ├── vae/                # VAE models
│   ├── controlnet/         # ControlNet models
│   ├── upscale_models/     # Upscaling models
│   └── clip/               # CLIP models
```

**Best Practices:**
- Place models directly in the `checkpoints` folder
- Use descriptive filenames for easy identification
- Keep original filenames for version tracking
- Organize by category, not by download date
- Document model sources and licenses

### UI Integration

**Refreshing the Model List:**
- If you add a model while the software is already running, you must click the **"Refresh" button** in the ComfyUI menu to make the new model appear in the Load Checkpoint dropdown list
- Located in the ComfyUI interface menu
- Updates the model list without restarting
- Essential after adding new models

**Model Loading:**
- Models appear in the Load Checkpoint node dropdown
- Select from the list to load
- First load may take time (model loading into VRAM)
- Subsequent loads are faster if model is cached

### Model Safety

**Best Practices:**
- Download from trusted sources (CivitAI, HuggingFace)
- Check file hashes when provided
- Scan for malware (rare but possible)
- Use `.safetensors` format when available
- Read model descriptions and reviews
- Check model licenses before commercial use

---

## Module 1 Summary

You've learned:
- ✅ The philosophy behind node-based AI interfaces
- ✅ How to set up ComfyUI on your system
- ✅ The five core nodes for image generation
- ✅ How to manage and organize AI models

**Next Steps:**
- Practice building basic workflows
- Experiment with different checkpoints
- Download and test various models
- Prepare for Module 2: Enhancing the Local Workflow

---

## Practice Exercises

1. **Basic Generation:**
   - Create a workflow with the five core nodes
   - Generate an image with a simple prompt
   - Experiment with different CFG scales (5, 7, 10, 12)

2. **Model Exploration:**
   - Download 2-3 different checkpoints from CivitAI
   - Generate the same prompt with each model
   - Compare results and note differences

3. **Workflow Documentation:**
   - Save your workflow as JSON
   - Embed workflow in a generated PNG
   - Share with a classmate for feedback
