---
title: "Module 2: Technical Architecture of 3D ASIN"
description: "Build the foundational architecture for 3D commerce platforms"
module: "2"
order: 2
---

# Module 2: Technical Architecture of 3D ASIN

**Duration:** Week 2  
**Learning Objectives:**
- Set up MERN stack foundation for 3D commerce platform
- Implement 3D rendering with Three.js and React Three Fiber
- Configure server-side batch rendering with Blender
- Deploy cloud infrastructure on AWS (EC2, Lambda, S3)
- Build microservices architecture for scalability

---

## 2.1 The MERN Stack & Microservices Foundation

### Architecture Overview

**Full-Stack Architecture:**
```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  - React Three Fiber (3D Viewer)        │
│  - Product Management UI                │
│  - Dashboard & Analytics                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      API Gateway (Express)              │
│  - RESTful endpoints                    │
│  - Authentication & Authorization       │
│  - Request routing                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Microservices Layer                │
│  ├─ Product Service (MongoDB)           │
│  ├─ 3D Asset Service (S3)               │
│  ├─ Rendering Service (Lambda)         │
│  └─ Amazon Integration Service          │
└─────────────────────────────────────────┘
```

### Project Structure

**Initial Setup:**
```bash
3d-commerce-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3DViewer/
│   │   │   ├── ProductCard/
│   │   │   └── Dashboard/
│   │   ├── hooks/
│   │   │   └── use3DModel.js
│   │   ├── utils/
│   │   │   └── gltfLoader.js
│   │   └── App.js
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── services/
│   │   ├── product/
│   │   ├── asset/
│   │   ├── rendering/
│   │   └── amazon/
│   ├── models/
│   │   └── Product.js
│   ├── routes/
│   │   └── api.js
│   ├── server.js
│   └── package.json
├── infrastructure/
│   ├── terraform/
│   ├── docker/
│   └── kubernetes/
└── README.md
```

### MongoDB Schema Design

**Product Collection:**
```javascript
{
  _id: ObjectId,
  asin: String, // Amazon ASIN
  title: String,
  description: String,
  price: Number,
  images: [String], // 2D image URLs
  model3d: {
    gltf: String, // S3 URL to GLB file
    usdz: String, // S3 URL to USDZ file
    thumbnail: String,
    metadata: {
      vertices: Number,
      triangles: Number,
      fileSize: Number,
      compression: String // 'draco' | 'meshopt'
    }
  },
  amazon: {
    asin: String,
    syncStatus: String, // 'pending' | 'synced' | 'error'
    lastSync: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

**User Collection:**
```javascript
{
  _id: ObjectId,
  email: String,
  password: String, // hashed
  subscription: {
    plan: String, // 'free' | 'pro' | 'enterprise'
    productsLimit: Number,
    expiresAt: Date
  },
  createdAt: Date
}
```

### Express API Setup

**Basic Server Structure:**
```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/amazon', require('./routes/amazon'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 2.2 3D Rendering Engines: Three.js and React Three Fiber

### Three.js Fundamentals

**Core Concepts:**
- **Scene:** Container for 3D objects
- **Camera:** Viewpoint (PerspectiveCamera, OrthographicCamera)
- **Renderer:** Draws the scene (WebGLRenderer)
- **Geometry:** Shape definition (BoxGeometry, SphereGeometry)
- **Material:** Surface appearance (MeshStandardMaterial)
- **Mesh:** Geometry + Material = visible object
- **Light:** Illumination (DirectionalLight, AmbientLight)

**Basic Three.js Setup:**
```javascript
import * as THREE from 'three';

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75, // FOV
  window.innerWidth / window.innerHeight, // Aspect
  0.1, // Near
  1000 // Far
);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Geometry & Material
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
```

### React Three Fiber Integration

**Why React Three Fiber?**
- Declarative 3D scene definition
- React hooks for 3D state management
- Automatic cleanup and optimization
- Easy integration with React ecosystem
- Better performance with React 18

**Basic R3F Component:**
```jsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Suspense } from 'react';

function ProductViewer({ modelUrl }) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Model url={modelUrl} />
        <OrbitControls enableZoom={true} enablePan={true} />
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
}

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}
```

### glTF Loading

**Using @react-three/drei:**
```jsx
import { useGLTF } from '@react-three/drei';

function ProductModel({ gltfUrl }) {
  const { scene, nodes, materials } = useGLTF(gltfUrl);
  
  return (
    <primitive 
      object={scene} 
      scale={1}
      position={[0, 0, 0]}
    />
  );
}

// Preload for better performance
useGLTF.preload('/models/product.glb');
```

**Custom Loader with Progress:**
```jsx
import { useProgress } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function LoadingIndicator() {
  const { progress } = useProgress();
  return <div>Loading: {progress}%</div>;
}

function ModelLoader({ url }) {
  const [model, setModel] = useState(null);
  
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => setModel(gltf.scene),
      (progress) => console.log('Progress:', progress),
      (error) => console.error('Error:', error)
    );
  }, [url]);
  
  return model ? <primitive object={model} /> : null;
}
```

### Interactive Controls

**OrbitControls:**
```jsx
import { OrbitControls } from '@react-three/drei';

<OrbitControls
  enableZoom={true}
  enablePan={true}
  enableRotate={true}
  minDistance={2}
  maxDistance={10}
  minPolarAngle={0}
  maxPolarAngle={Math.PI / 2}
/>
```

**Custom Interactions:**
```jsx
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function InteractiveModel({ url }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      <Model url={url} />
    </mesh>
  );
}
```

---

## 2.3 Server-Side Batch Rendering with Blender

### Why Headless Blender?

**Use Cases:**
- Generate product thumbnails
- Create marketing renders
- Batch process 3D models
- Convert formats
- Apply materials automatically

### Blender Python API

**Basic Script:**
```python
import bpy
import sys
import os

# Clear existing mesh
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Import GLB file
input_path = sys.argv[4]  # GLB file path
bpy.ops.import_scene.gltf(filepath=input_path)

# Set up scene
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080

# Set up camera
bpy.ops.object.camera_add(location=(5, -5, 3))
camera = bpy.context.object
camera.rotation_euler = (1.1, 0, 0.785)
scene.camera = camera

# Add lighting
bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))

# Render
output_path = sys.argv[5]  # Output image path
scene.render.filepath = output_path
bpy.ops.render.render(write_still=True)
```

### Docker Container for Blender

**Dockerfile:**
```dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    blender \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY render_script.py .

ENTRYPOINT ["blender", "--background", "--python", "render_script.py"]
```

### AWS Lambda Integration

**Lambda Function for Rendering:**
```javascript
const { exec } = require('child_process');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const { glbUrl, outputKey } = event;
  
  // Download GLB from S3
  const glbPath = `/tmp/model.glb`;
  await downloadFromS3(glbUrl, glbPath);
  
  // Run Blender render
  const outputPath = `/tmp/render.png`;
  await runBlenderRender(glbPath, outputPath);
  
  // Upload to S3
  await uploadToS3(outputPath, outputKey);
  
  return { success: true, outputKey };
};

async function runBlenderRender(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    exec(
      `blender --background --python render_script.py -- ${inputPath} ${outputPath}`,
      (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout);
      }
    );
  });
}
```

**Note:** Lambda has 15-minute timeout limit. For longer renders, use EC2 or ECS.

---

## 2.4 Cloud Infrastructure: AWS Setup

### S3 for Digital Asset Management

**Bucket Structure:**
```
s3://your-bucket/
├── models/
│   ├── {productId}/
│   │   ├── original.glb
│   │   ├── compressed.glb
│   │   ├── usdz/
│   │   │   └── model.usdz
│   │   └── thumbnails/
│   │       ├── front.png
│   │       ├── side.png
│   │       └── top.png
├── renders/
│   └── {productId}/
│       └── {timestamp}.png
└── uploads/
    └── {userId}/
        └── {tempId}.glb
```

**S3 Configuration:**
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

// Upload function
async function uploadModel(fileBuffer, key) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: 'model/gltf-binary',
    ACL: 'public-read' // Or use CloudFront for better performance
  };
  
  return s3.upload(params).promise();
}

// Generate presigned URL for uploads
function generatePresignedUploadUrl(key) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: 'model/gltf-binary',
    Expires: 3600 // 1 hour
  };
  
  return s3.getSignedUrl('putObject', params);
}
```

### EC2 for Rendering Service

**EC2 Instance Setup:**
- **Instance Type:** g4dn.xlarge (GPU for Blender rendering)
- **AMI:** Ubuntu 22.04 with Blender pre-installed
- **Storage:** 100GB EBS for temporary files
- **Auto-scaling:** Scale based on rendering queue

**EC2 Rendering Service:**
```javascript
// rendering-service.js
const express = require('express');
const { exec } = require('child_process');
const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

const app = express();
app.use(express.json());

// Process rendering jobs from SQS
app.post('/process-job', async (req, res) => {
  const { jobId, glbUrl, outputKey } = req.body;
  
  try {
    // Download GLB
    const glbPath = await downloadFromS3(glbUrl);
    
    // Render with Blender
    const renderPath = await renderWithBlender(glbPath);
    
    // Upload result
    await uploadToS3(renderPath, outputKey);
    
    // Notify completion
    await notifyCompletion(jobId, outputKey);
    
    res.json({ success: true });
  } catch (error) {
    await notifyError(jobId, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Rendering service running on port 3000');
  startSQSListener();
});
```

### Lambda for Serverless Functions

**Lambda Functions:**
1. **Model Upload Handler:**
```javascript
exports.handler = async (event) => {
  const { productId, fileBuffer } = JSON.parse(event.body);
  
  // Validate file
  // Compress model
  // Upload to S3
  // Update database
  // Trigger rendering job
  
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
```

2. **Format Converter:**
```javascript
exports.handler = async (event) => {
  const { glbUrl, targetFormat } = event;
  
  // Download GLB
  // Convert to target format (USDZ, etc.)
  // Upload converted file
  // Return URL
  
  return { convertedUrl: '...' };
};
```

3. **Thumbnail Generator:**
```javascript
exports.handler = async (event) => {
  const { glbUrl } = event;
  
  // Generate multiple thumbnail angles
  // Upload to S3
  // Return thumbnail URLs
  
  return { thumbnails: [...] };
};
```

### Infrastructure as Code (Terraform)

**Basic Terraform Configuration:**
```hcl
# terraform/main.tf
provider "aws" {
  region = "us-east-1"
}

# S3 Bucket
resource "aws_s3_bucket" "models" {
  bucket = "3d-commerce-models-${var.environment}"
}

resource "aws_s3_bucket_public_access_block" "models" {
  bucket = aws_s3_bucket.models.id
  block_public_acls = false
  block_public_policy = false
}

# EC2 Instance for Rendering
resource "aws_instance" "renderer" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "g4dn.xlarge"
  
  tags = {
    Name = "3d-renderer-${var.environment}"
  }
}

# Lambda Function
resource "aws_lambda_function" "converter" {
  filename      = "converter.zip"
  function_name = "3d-format-converter"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
}
```

---

## Lab 2: Build Basic 3D Viewer with React Three Fiber

### Objective
Create a functional 3D product viewer using React Three Fiber.

### Tasks

1. **Project Setup (30 min)**
   - Initialize React app with Vite
   - Install dependencies (react-three-fiber, drei, three)
   - Set up basic project structure

2. **3D Viewer Component (2 hours)**
   - Create Canvas component
   - Load and display GLB model
   - Implement OrbitControls
   - Add lighting and environment

3. **Product Card Integration (1 hour)**
   - Create product card component
   - Integrate 3D viewer
   - Add loading states
   - Handle errors gracefully

4. **Backend API (1 hour)**
   - Set up Express server
   - Create product endpoints
   - Connect to MongoDB
   - Serve 3D model URLs

### Deliverables

1. **Frontend Application**
   - React app with 3D viewer
   - Product listing page
   - Individual product viewer page
   - Responsive design

2. **Backend API**
   - RESTful endpoints for products
   - MongoDB integration
   - CORS configuration
   - Error handling

3. **Documentation**
   - Setup instructions
   - API documentation
   - Component usage examples

### Evaluation Criteria

- **Functionality (40%):** 3D viewer works correctly
- **Code Quality (30%):** Clean, well-structured code
- **User Experience (20%):** Smooth interactions, loading states
- **Documentation (10%):** Clear setup and usage docs

### Resources

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber/)
- [Three.js Examples](https://threejs.org/examples/)
- Sample GLB models from [Sketchfab](https://sketchfab.com/)

---

## Key Takeaways

✅ **MERN stack provides solid foundation for 3D commerce platforms**  
✅ **React Three Fiber makes 3D rendering declarative and React-friendly**  
✅ **Blender headless enables server-side batch rendering**  
✅ **AWS infrastructure (S3, EC2, Lambda) scales to any size**  
✅ **Microservices architecture enables independent scaling**

---

## Next Steps

- Complete Lab 2: Build 3D Viewer
- Review Module 3: 3D Standards and Optimization
- Set up AWS account and services
- Prepare sample 3D models for testing

---

**Ready to optimize? Let's move to [Module 3: 3D Standards and Optimization →](Module_03_3D_Standards_and_Optimization.md)**
