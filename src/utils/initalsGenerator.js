export function generateInitials(fullName) {
    if (!fullName || fullName.trim().length === 0) {
        return "N/A"; // Return empty string for blank names
    }

    const names = fullName.trim().split(" ");
    const initials = names.map((n) => n.charAt(0).toUpperCase());

    if (initials.length === 1) {
        return initials[0]; // Return single initial if only one name is available
    } else {
        return initials[0] + initials[initials.length - 1]; // Return first and last initials for multiple names
    }
}