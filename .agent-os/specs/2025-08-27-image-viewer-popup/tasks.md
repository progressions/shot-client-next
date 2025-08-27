# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-08-27-image-viewer-popup/spec.md

> Created: 2025-08-27
> Status: Ready for Implementation

## Tasks

### 1. Create ImageViewerModal Component

- [ ] 1.1 Create new file `shot-client-next/src/components/ui/ImageViewerModal.tsx`
  - [ ] 1.1.1 Define ImageViewerModalProps interface with open, onClose, imageUrl, altText, and optional entity props
  - [ ] 1.1.2 Implement base Modal/Dialog structure using Material-UI
  - [ ] 1.1.3 Add semi-transparent backdrop with 0.8 opacity
  - [ ] 1.1.4 Create image container with proper centering

- [ ] 1.2 Implement image display logic
  - [ ] 1.2.1 Add responsive sizing that fits within viewport bounds
  - [ ] 1.2.2 Maintain aspect ratio for all image sizes
  - [ ] 1.2.3 Create toggle button for "Fit to Screen" vs "Original Size" modes
  - [ ] 1.2.4 Implement scroll behavior for oversized images in Original Size mode

- [ ] 1.3 Add interaction handlers
  - [ ] 1.3.1 Implement ESC key handler for modal dismissal
  - [ ] 1.3.2 Add backdrop click handler with stopPropagation on image
  - [ ] 1.3.3 Create close button (X icon) in top-right corner
  - [ ] 1.3.4 Prevent body scroll when modal is open

- [ ] 1.4 Implement loading and error states
  - [ ] 1.4.1 Add loading spinner/skeleton while image loads
  - [ ] 1.4.2 Create error state with fallback placeholder
  - [ ] 1.4.3 Handle image load events and state transitions
  - [ ] 1.4.4 Show loading indicator for large images (>500KB)

- [ ] 1.5 Add animations and transitions
  - [ ] 1.5.1 Implement fade-in animation for backdrop (200ms)
  - [ ] 1.5.2 Add scale-up animation for image (250ms ease-out)
  - [ ] 1.5.3 Create smooth transitions for display mode switching
  - [ ] 1.5.4 Add fade-out animation on modal close

- [ ] 1.6 Implement accessibility features
  - [ ] 1.6.1 Add ARIA labels and role="dialog", aria-modal="true"
  - [ ] 1.6.2 Implement focus trap within modal
  - [ ] 1.6.3 Restore focus to trigger element on close
  - [ ] 1.6.4 Add screen reader announcements for state changes

### 2. Modify ImageBox Component

- [ ] 2.1 Update component interface
  - [ ] 2.1.1 Add optional onClick prop to ImageBoxProps type
  - [ ] 2.1.2 Update prop destructuring in component

- [ ] 2.2 Implement click handling
  - [ ] 2.2.1 Add click handler that checks if not dragging/repositioning
  - [ ] 2.2.2 Call onClick prop only when not in reposition mode
  - [ ] 2.2.3 Prevent click during drag operations
  - [ ] 2.2.4 Add click event to complement existing mouse/touch handlers

- [ ] 2.3 Update cursor styles
  - [ ] 2.3.1 Show pointer cursor when clickable (not repositioning)
  - [ ] 2.3.2 Maintain existing grab/move cursors during reposition
  - [ ] 2.3.3 Ensure visual feedback for clickable state

### 3. Integrate Modal with PositionableImage

- [ ] 3.1 Add modal state management
  - [ ] 3.1.1 Add useState for modal open/closed state
  - [ ] 3.1.2 Create handleImageClick function to open modal
  - [ ] 3.1.3 Create handleModalClose function

- [ ] 3.2 Import and render ImageViewerModal
  - [ ] 3.2.1 Import ImageViewerModal component
  - [ ] 3.2.2 Add ImageViewerModal to component render
  - [ ] 3.2.3 Pass entity.image_url and entity.name as props
  - [ ] 3.2.4 Connect open/close handlers

- [ ] 3.3 Connect ImageBox click handler
  - [ ] 3.3.1 Pass handleImageClick to ImageBox onClick prop
  - [ ] 3.3.2 Ensure click only works when not repositioning
  - [ ] 3.3.3 Verify drag functionality remains intact

### 4. Update Component Exports

- [ ] 4.1 Export ImageViewerModal from index
  - [ ] 4.1.1 Add ImageViewerModal export to `src/components/ui/index.ts`
  - [ ] 4.1.2 Ensure proper named export format
  - [ ] 4.1.3 Maintain alphabetical ordering if applicable

### 5. Performance Optimizations

- [ ] 5.1 Implement lazy loading
  - [ ] 5.1.1 Use Next.js dynamic import for ImageViewerModal
  - [ ] 5.1.2 Load component only when first image is clicked
  - [ ] 5.1.3 Show loading state during dynamic import

- [ ] 5.2 Optimize animations
  - [ ] 5.2.1 Use CSS transform instead of position properties
  - [ ] 5.2.2 Add will-change hints for animated properties
  - [ ] 5.2.3 Use GPU-accelerated properties

- [ ] 5.3 Add responsive behavior
  - [ ] 5.3.1 Implement resize observer for viewport changes
  - [ ] 5.3.2 Debounce resize handlers (250ms delay)
  - [ ] 5.3.3 Recalculate image dimensions on resize

### 6. Testing and Verification

- [ ] 6.1 Manual testing checklist
  - [ ] 6.1.1 Click character portrait to open modal
  - [ ] 6.1.2 Verify ESC key closes modal
  - [ ] 6.1.3 Verify backdrop click closes modal
  - [ ] 6.1.4 Verify close button works
  - [ ] 6.1.5 Test display mode toggle
  - [ ] 6.1.6 Verify reposition mode still works
  - [ ] 6.1.7 Test with various image sizes and ratios
  - [ ] 6.1.8 Verify body scroll is prevented when modal open

- [ ] 6.2 Browser compatibility testing
  - [ ] 6.2.1 Test in Chrome/Edge
  - [ ] 6.2.2 Test in Firefox
  - [ ] 6.2.3 Test in Safari
  - [ ] 6.2.4 Test on mobile browsers

- [ ] 6.3 Accessibility testing
  - [ ] 6.3.1 Verify keyboard navigation works
  - [ ] 6.3.2 Test with screen reader
  - [ ] 6.3.3 Verify focus management
  - [ ] 6.3.4 Check ARIA labels and roles

- [ ] 6.4 Performance testing
  - [ ] 6.4.1 Verify smooth animations (60fps)
  - [ ] 6.4.2 Test with large images (>5MB)
  - [ ] 6.4.3 Check memory usage doesn't increase over time
  - [ ] 6.4.4 Verify lazy loading works correctly

### 7. Documentation

- [ ] 7.1 Update component documentation
  - [ ] 7.1.1 Add JSDoc comments to ImageViewerModal
  - [ ] 7.1.2 Document props and usage examples
  - [ ] 7.1.3 Add inline comments for complex logic

- [ ] 7.2 Update CLAUDE.md if needed
  - [ ] 7.2.1 Add note about image viewer functionality
  - [ ] 7.2.2 Document any new patterns introduced

## Definition of Done

- [ ] All tasks completed and checked off
- [ ] Code follows existing patterns and conventions
- [ ] No TypeScript errors or warnings
- [ ] Manual testing completed across browsers
- [ ] Accessibility requirements met
- [ ] Performance targets achieved (smooth animations, fast load)
- [ ] Code committed to image-viewer-popup branch