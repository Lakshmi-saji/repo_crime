export async function uploadEvidence(file, firId, setProgress) {
    return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            if (setProgress) setProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                // Simulate a real URL using dummy path
                resolve(`https://mock-storage.com/${firId}/${file.name}`);
            }
        }, 200);
    });
}
