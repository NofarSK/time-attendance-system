export const formatTime = (time) => {
    if (!time) return '';

    const [hours, minutes, seconds] = time.split(':').map(String);

    // Convert to 12-hour format
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; // Convert 0 to 12

    return `${displayHour}:${minutes}:${seconds} ${ampm}`;
};


export const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '';

    // Parse time strings to get hours, minutes, seconds
    const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number);
    const [endHours, endMinutes, endSeconds] = endTime.split(':').map(Number);

    // Convert to total seconds
    const startTotalSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;
    const endTotalSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;

    // Calculate difference in seconds, handling next-day checkout
    let diffSeconds = endTotalSeconds - startTotalSeconds;
    if (diffSeconds < 0) {
        diffSeconds += 24 * 3600; // Add 24 hours in seconds
    }

    // Convert back to hours, minutes, seconds
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    // Format the result with leading zeros
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};


export const isValidTimeFormat = (timeString) => {
    if (!timeString) return false;
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return timePattern.test(timeString);
};


export const formatDate = (dateString) => {
    if (!dateString) return '';

    const [day, month, year] = dateString.split('/').map(Number);

    const date = new Date(year, month - 1, day);

    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };

    return date.toLocaleDateString('en-US', options);
};