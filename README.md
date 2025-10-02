# 🌊 Waves - Charlie Brockmeier Personal Website

A stunning desktop-only personal splash page featuring a fullscreen wave video background with elegant overlay content.

## Features

- **Fullscreen Wave Video Background**: Autoplay, muted, looping video that covers the entire viewport
- **Gradient Overlay**: Semi-transparent dark gradient for text readability
- **Centered Content**: Elegant typography with smooth fade-in animations
- **Interactive Button**: "Dive In" button with hover glow and ripple effects
- **Subtle Parallax**: Mouse-based parallax movement for enhanced interactivity
- **Performance Optimized**: Video pauses when tab is not visible

## Setup Instructions

### 1. Video Background

You need to add a high-quality wave video file named `waves-background.mp4` to this directory. 

**Recommended specifications:**
- **Resolution**: 1920x1080 (Full HD) or higher
- **Format**: MP4 (H.264 codec for best browser compatibility)
- **Duration**: 10-30 seconds (will loop seamlessly)
- **Content**: Ocean waves crashing on a sandy beach with white foam
- **File size**: Aim for under 50MB for good loading performance

**Where to find wave videos:**
- **Free options**: Pexels, Pixabay, Unsplash (search for "ocean waves", "beach waves")
- **Premium options**: Shutterstock, Getty Images, Adobe Stock
- **Recommended search terms**: "ocean waves beach", "waves crashing shore", "sea waves loop"

### 2. File Structure

```
Waves/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # Interactive functionality
├── waves-background.mp4 # Your wave video (you need to add this)
└── README.md           # This file
```

### 3. Running the Website

1. Add your `waves-background.mp4` file to this directory
2. Open `index.html` in a modern web browser
3. The video should autoplay and loop seamlessly

**Note**: Some browsers may block autoplay. If the video doesn't start automatically, the fallback gradient background will display.

## Customization

### Colors
- Gradient overlay: Modify `rgba` values in `.gradient-overlay` class
- Text colors: Adjust in `.main-heading` and `.sub-heading` classes
- Button styling: Customize in `.dive-button` class

### Typography
- Font sizes: Adjust `font-size` values for different screen sizes
- Font family: Change in the `body` selector

### Animations
- Timing: Modify `animation-delay` values in CSS
- Effects: Adjust `@keyframes` animations

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

**Note**: This is designed for desktop viewing only and may not display optimally on mobile devices.

## Performance Tips

- Keep video file size under 50MB
- Use H.264 codec for best compatibility
- Consider using a CDN for faster loading
- The video automatically pauses when the tab is not visible to save resources

## Troubleshooting

**Video not playing?**
- Check that `waves-background.mp4` exists in the same directory as `index.html`
- Ensure the video file is in MP4 format with H.264 codec
- Some browsers require user interaction before playing video - this is handled by the fallback background

**Performance issues?**
- Reduce video file size or resolution
- Check browser developer tools for any console errors
