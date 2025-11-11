// Global Variables
let videoStream = null;
let isRunning = false;
let detectionInterval = null;
let modelsLoaded = false;

// Stabilization variables
const predictionHistory = {
    age: [],
    gender: [],
    maxHistorySize: 5 // Keep last 5 predictions for smoothing
};

// DOM Elements
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = statusIndicator.querySelector('.status-text');
const predictionContent = document.getElementById('predictionContent');
const noDetection = document.querySelector('.no-detection');
const detectionResults = document.getElementById('detectionResults');
const ageResult = document.getElementById('ageResult');
const genderResult = document.getElementById('genderResult');
const toggleBtn = document.getElementById('toggleBtn');

// Initialize the application
async function init() {
    try {
        updateStatus('Modeller yükleniyor...', false);
        await loadModels();
        
        updateStatus('Kamera açılıyor...', false);
        await startCamera();
        
        updateStatus('Hazır - Yüz algılama aktif', true);
        startDetection();
    } catch (error) {
        console.error('Initialization error:', error);
        updateStatus('Hata: ' + error.message, false);
    }
}

// Load face-api.js models
async function loadModels() {
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
    
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        ]);
        modelsLoaded = true;
        console.log('Models loaded successfully');
    } catch (error) {
        throw new Error('Model yüklenemedi. İnternet bağlantınızı kontrol edin.');
    }
}

// Start camera with mobile support
async function startCamera() {
    try {
        const constraints = {
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = videoStream;

        // Wait for video to be ready
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                
                // Set canvas size to match video
                overlay.width = video.videoWidth;
                overlay.height = video.videoHeight;
                
                resolve();
            };
        });
    } catch (error) {
        console.error('Camera error:', error);
        throw new Error('Kamera erişimi reddedildi veya kamera bulunamadı.');
    }
}

// Start face detection loop
function startDetection() {
    if (!modelsLoaded || isRunning) return;
    
    isRunning = true;
    
    // Run detection every 1 second for stability
    detectionInterval = setInterval(async () => {
        await detectFace();
    }, 1000);
}

// Stop detection
function stopDetection() {
    if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
    }
    isRunning = false;
    
    // Clear canvas
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    // Show no detection message
    showNoDetection();
}

// Detect face and predict age/gender
async function detectFace() {
    if (!video.videoWidth || !video.videoHeight) return;

    try {
        // Detect face with age and gender
        const detections = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
                inputSize: 416,
                scoreThreshold: 0.5
            }))
            .withAgeAndGender();

        // Clear canvas
        const ctx = overlay.getContext('2d');
        ctx.clearRect(0, 0, overlay.width, overlay.height);

        if (detections) {
            // Check if face is within detection frame
            const isInFrame = checkFaceInFrame(detections.detection.box);
            
            if (isInFrame) {
                // Add to prediction history for smoothing
                addPredictionToHistory(detections.age, detections.gender);
                
                // Get smoothed predictions
                const smoothedAge = getSmoothedAge();
                const smoothedGender = getSmoothedGender();
                
                // Update UI with predictions
                showDetection(smoothedAge, smoothedGender);
                
                // Optional: Draw face box (commented out for cleaner UI)
                // drawDetectionBox(ctx, detections.detection.box);
            } else {
                // Face detected but not in frame
                clearPredictionHistory();
                showNoDetection('Yüzünüzü çerçeveye getirin');
            }
        } else {
            // No face detected
            clearPredictionHistory();
            showNoDetection();
        }
    } catch (error) {
        console.error('Detection error:', error);
    }
}

// Check if face bounding box is within detection frame
function checkFaceInFrame(box) {
    const videoRect = video.getBoundingClientRect();
    const detectionFrame = document.querySelector('.detection-frame');
    const frameRect = detectionFrame.getBoundingClientRect();
    
    // Calculate face position in screen coordinates
    const scaleX = videoRect.width / video.videoWidth;
    const scaleY = videoRect.height / video.videoHeight;
    
    // Mirror the x coordinate (because video is mirrored)
    const faceX = videoRect.left + (video.videoWidth - box.x - box.width) * scaleX;
    const faceY = videoRect.top + box.y * scaleY;
    const faceWidth = box.width * scaleX;
    const faceHeight = box.height * scaleY;
    
    // Check if face center is within frame (with some tolerance)
    const faceCenterX = faceX + faceWidth / 2;
    const faceCenterY = faceY + faceHeight / 2;
    
    const tolerance = 50; // pixels
    const isInFrame = 
        faceCenterX >= frameRect.left - tolerance &&
        faceCenterX <= frameRect.right + tolerance &&
        faceCenterY >= frameRect.top - tolerance &&
        faceCenterY <= frameRect.bottom + tolerance;
    
    return isInFrame;
}

// Draw detection box on canvas (optional)
function drawDetectionBox(ctx, box) {
    ctx.strokeStyle = '#007BFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
}

// Add prediction to history for smoothing
function addPredictionToHistory(age, gender) {
    predictionHistory.age.push(age);
    predictionHistory.gender.push(gender);
    
    // Keep only last N predictions
    if (predictionHistory.age.length > predictionHistory.maxHistorySize) {
        predictionHistory.age.shift();
    }
    if (predictionHistory.gender.length > predictionHistory.maxHistorySize) {
        predictionHistory.gender.shift();
    }
}

// Get smoothed age prediction
function getSmoothedAge() {
    if (predictionHistory.age.length === 0) return 0;
    
    const sum = predictionHistory.age.reduce((a, b) => a + b, 0);
    const avg = sum / predictionHistory.age.length;
    
    // Round to nearest integer and create range
    const roundedAge = Math.round(avg);
    return `${roundedAge - 2}-${roundedAge + 2}`;
}

// Get smoothed gender prediction
function getSmoothedGender() {
    if (predictionHistory.gender.length === 0) return 'unknown';
    
    // Count occurrences
    const counts = {};
    predictionHistory.gender.forEach(g => {
        counts[g] = (counts[g] || 0) + 1;
    });
    
    // Return most common gender
    const mostCommon = Object.keys(counts).reduce((a, b) => 
        counts[a] > counts[b] ? a : b
    );
    
    return mostCommon === 'male' ? 'Erkek' : 'Kadın';
}

// Clear prediction history
function clearPredictionHistory() {
    predictionHistory.age = [];
    predictionHistory.gender = [];
}

// Show detection results
function showDetection(age, gender) {
    noDetection.style.display = 'none';
    detectionResults.style.display = 'block';
    
    ageResult.textContent = age;
    genderResult.textContent = gender;
}

// Show no detection message
function showNoDetection(message = 'Yüzünüzü çerçeveye getirin') {
    detectionResults.style.display = 'none';
    noDetection.style.display = 'block';
    noDetection.querySelector('p').textContent = message;
}

// Update status indicator
function updateStatus(text, isActive) {
    statusText.textContent = text;
    if (isActive) {
        statusIndicator.classList.add('active');
    } else {
        statusIndicator.classList.remove('active');
    }
}

// Toggle detection on/off
toggleBtn.addEventListener('click', () => {
    if (isRunning) {
        stopDetection();
        toggleBtn.querySelector('span').textContent = 'Başlat';
        updateStatus('Durduruldu', false);
    } else {
        startDetection();
        toggleBtn.querySelector('span').textContent = 'Durdur';
        updateStatus('Hazır - Yüz algılama aktif', true);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (video.videoWidth && video.videoHeight) {
        overlay.width = video.videoWidth;
        overlay.height = video.videoHeight;
    }
});

// Start the application when page loads
window.addEventListener('DOMContentLoaded', init);
