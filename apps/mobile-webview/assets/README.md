# Assets Directory

This directory should contain the following image files for your app:

## Required Files

### icon.png

- Size: 1024x1024 pixels
- Format: PNG with transparency
- Purpose: App icon for iOS and Android
- Note: Will be automatically resized for different devices

### adaptive-icon.png

- Size: 1024x1024 pixels
- Format: PNG with transparency
- Purpose: Android adaptive icon foreground
- Note: Keep important content in center 512x512 area

### splash.png

- Size: 1284x2778 pixels (iPhone 14 Pro Max)
- Format: PNG
- Purpose: Splash screen shown while app loads
- Note: Will be scaled for different screen sizes

### favicon.png

- Size: 48x48 pixels
- Format: PNG
- Purpose: Web favicon (if running on web)

## How to Add Your Assets

1. Create or export your logo/brand images
2. Resize them to the dimensions above
3. Save them in this directory with the exact filenames
4. Run `expo start` to see changes

## Temporary Placeholders

Until you add your own assets, Expo will use default placeholders.
The app will still run, but you should replace these before building for production.

## Tools for Creating Assets

- **Figma**: Design and export at exact sizes
- **Canva**: Quick logo creation
- **ImageMagick**: Batch resize from command line
  ```bash
  convert logo.png -resize 1024x1024 icon.png
  ```

## Testing

After adding assets:

```bash
expo start --clear
```

This clears the cache and loads your new assets.
