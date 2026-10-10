const generateMeetingId = () => {
    const part1 = Math.random().toString(36).substring(2, 5);
    const part2 = Math.random().toString(36).substring(2, 5);
    const part3 = Math.random().toString(36).substring(2, 5);

    return `${part1}-${part2}-${part3}`;
};

module.exports = generateMeetingId;