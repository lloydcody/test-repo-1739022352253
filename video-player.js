const videoContainer = document.getElementById('p4vid');
const video = document.getElementById('dmbvideo');

// Set up MutationObserver to listen for class changes
const observer = new MutationObserver((mutationsList) => {
  mutationsList.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {

      const seekRegex = /video-seek-to-(\d+)/; // Regex to capture the time value
      const match = videoContainer.className.match(seekRegex);
      if (match) {
        const seekTime = parseInt(match[1], 10);
        video.currentTime = seekTime; // Seek to extracted time
      }

      if (videoContainer.classList.contains('video-playing')) {
        // Start the video playback when the class is added
        video.play();
      } else {
        video.pause();
      }
    }
  });
});

// Start observing class attribute changes
observer.observe(videoContainer, {
  attributes: true, // observe changes to attributes
  attributeFilter: ['class'], // only listen for changes to the class attribute
});
