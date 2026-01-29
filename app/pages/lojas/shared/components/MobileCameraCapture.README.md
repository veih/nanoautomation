# Mobile Camera Capture Component

## Overview

The MobileCameraCapture component provides a user-friendly interface for capturing photos directly from a device's camera on mobile devices. It's designed to work seamlessly with the existing FormModal component in the lojas module.

## Features

- Direct camera access on mobile devices
- Camera switching between front and rear cameras
- Photo capture with preview
- Multiple photo capture support
- Image preview with delete functionality
- Responsive design for mobile and desktop

## Usage

### Integration with FormModal

The component is designed to work with the FormModal component through the following props:

```typescript
// In your parent component
const [showCamera, setShowCamera] = useState(false);
const [images, setImages] = useState<string[]>([]);

const handleCameraCapture = (imageData: string) => {
  setImages(prev => [...prev, imageData]);
};

// In your FormModal
<FormModal
  // ... other props
  showCameraButton={true}
  onOpenCamera={() => setShowCamera(true)}
/>

<MobileCameraCapture
  show={showCamera}
  onHide={() => setShowCamera(false)}
  onCapture={handleCameraCapture}
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| show | boolean | Yes | Controls the visibility of the modal |
| onHide | function | Yes | Callback when the modal is closed |
| onCapture | function | Yes | Callback when photos are captured |
| maxImages | number | No | Maximum number of images allowed (default: 5) |

## Implementation Details

### Camera Access

The component uses the `navigator.mediaDevices.getUserMedia()` API to access the device's camera:

```typescript
const mediaStream = await navigator.mediaDevices.getUserMedia({
  video: { 
    facingMode: facingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 }
  },
  audio: false
});
```

### Image Capture

Images are captured using a canvas element:

```typescript
const video = videoRef.current;
const canvas = canvasRef.current;
const context = canvas.getContext('2d');

// Set canvas dimensions to match video
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

// Draw video frame to canvas
context.drawImage(video, 0, 0, canvas.width, canvas.height);

// Convert to data URL
const imageData = canvas.toDataURL('image/jpeg', 0.8);
```

## Browser Support

The component works on all modern browsers that support the MediaDevices API:

- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 12+

## Permissions

The component requires camera permissions. Users will be prompted to allow camera access when the modal is opened.

## Error Handling

Common errors are handled gracefully:

- Camera access denied
- No camera available
- Browser not supported

## Styling

The component uses React Bootstrap components and Bootstrap Icons for a consistent look and feel with the rest of the application.

## Customization

You can customize the maximum number of images allowed by passing the `maxImages` prop:

```typescript
<MobileCameraCapture
  show={showCamera}
  onHide={() => setShowCamera(false)}
  onCapture={handleCameraCapture}
  maxImages={10}
/>
```