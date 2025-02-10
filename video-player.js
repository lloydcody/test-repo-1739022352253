const videoContainer = document.getElementById('p4vid');
const video = document.getElementById('dmbvideo');
const targetClass = 'video-playing'; // the class that triggers playback

// Set up MutationObserver to listen for class changes
const observer = new MutationObserver((mutationsList) => {
  mutationsList.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      // Check if the target class is added or removed
      if (videoContainer.classList.contains(targetClass)) {
        // Start the video playback when the class is added
        video.currentTime = 0;
        video.play();
      } else {
        // Wait for transition to end and then pause the video
        videoContainer.addEventListener('transitionend', () => {
          video.pause();
        }, { once: true });
      }
    }
  });
});

// Start observing class attribute changes
observer.observe(videoContainer, {
  attributes: true, // observe changes to attributes
  attributeFilter: ['class'], // only listen for changes to the class attribute
});
