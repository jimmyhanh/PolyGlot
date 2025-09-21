# PolyGlot - Modular Structure

This project has been refactored into a modular structure for better maintainability and organization.

## 📁 Project Structure

```
PolyGlot/
├── index.html              # Main HTML file
├── main.js                 # Application entry point
├── sw.js                   # Service worker
├── css/                    # Modular CSS files
│   ├── base.css           # Reset & fundamental styles
│   ├── header.css         # Header & branding
│   ├── translation-container.css  # Main translation interface
│   ├── controls.css       # Control panel & interactive elements
│   ├── history.css        # Translation history panel
│   ├── notifications.css  # Toast notifications
│   └── responsive.css     # Responsive design & mobile optimizations
├── js/                     # Modular JavaScript files
│   ├── ApiManager.js      # OpenAI API integration
│   ├── VoiceController.js # Speech recognition & synthesis
│   ├── TranslationEngine.js # Core translation logic
│   ├── HistoryManager.js  # Translation history management
│   ├── UIController.js    # UI interactions & notifications
│   └── EventManager.js    # Event handling & keyboard shortcuts
└── original/              # Backup of original files
    ├── script.js         # Original monolithic JavaScript
    └── styles.css        # Original monolithic CSS
```

## 🧩 JavaScript Modules

### ApiManager.js
- Handles OpenAI API key management
- Makes API calls for translation and language detection
- Manages API error handling

### VoiceController.js
- Speech recognition setup and control
- Text-to-speech functionality
- Voice input state management

### TranslationEngine.js
- Core translation logic
- Language management
- Live translation and debouncing
- Character counting and status updates

### HistoryManager.js
- Translation history storage and retrieval
- Local storage management
- History item rendering and interaction

### UIController.js
- UI state management
- Toast notifications
- Clipboard operations
- Element manipulation helpers

### EventManager.js
- Event listener setup and management
- Keyboard shortcuts
- Custom event handling
- Module coordination

## 🎨 CSS Modules

### base.css
- CSS reset and normalization
- Base typography and color scheme
- Common button and form styles
- Accessibility features

### header.css
- Application header and branding
- Logo and subtitle styling
- API key configuration panel

### translation-container.css
- Main translation interface layout
- Language selection panels
- Text areas and voice controls
- Swap languages functionality

### controls.css
- Control panel layout
- Toggle switches and buttons
- Loading indicators and spinners

### history.css
- Translation history panel
- History item styling
- No-history state

### notifications.css
- Toast notification system
- Different notification types (success, error, warning, info)
- Animation effects

### responsive.css
- Mobile-first responsive design
- Tablet and mobile optimizations
- Print styles
- High DPI display support

## 🔧 Benefits of Modular Structure

1. **Maintainability**: Easier to find and modify specific functionality
2. **Reusability**: Modules can be reused in other projects
3. **Testing**: Individual modules can be tested in isolation
4. **Collaboration**: Multiple developers can work on different modules
5. **Performance**: Better caching and selective loading
6. **Organization**: Clear separation of concerns

## 🚀 Usage

The application works exactly the same as before, but now with better code organization:

1. Open `index.html` in a web browser
2. Enter your OpenAI API key
3. Start translating text
4. All functionality remains the same

## 🔄 Migration from Original

If you need to revert to the original structure:

1. Copy `original/script.js` to the root directory
2. Copy `original/styles.css` to the root directory  
3. Update `index.html` to use the original file references
4. Remove the `css/` and `js/` directories

## 📝 Development Notes

- All modules use ES6 import/export syntax
- Event-driven architecture for module communication
- Consistent error handling across modules
- Responsive design principles throughout
- Accessibility features maintained

## 🤝 Contributing

When adding new features:

1. Choose the appropriate module or create a new one
2. Follow the established patterns
3. Update this README if adding new modules
4. Maintain backward compatibility
5. Test across different devices and browsers