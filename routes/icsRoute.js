import express from "express";
import { createEvent } from "ics";

const router = express.Router();

router.get("/generate-ics", (req, res) => {
    const { title, start, end, location, description } = req.query;

    if (!title || !start || !end) {
        return res.status(400).send("Missing required fields");
    }

    // Ensure start and end are in the correct format
    const parseDate = (dateString) => {
        const dateParts = dateString.split(/[-T:]/).map(Number); // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:MM"
        if (dateParts.length < 3) return null; // Ensure at least YYYY-MM-DD is provided
        return dateParts.length >= 5
            ? [dateParts[0], dateParts[1], dateParts[2], dateParts[3] || 0, dateParts[4] || 0]
            : [dateParts[0], dateParts[1], dateParts[2], 0, 0]; // Default time to 00:00 if not provided
    };

    const startDate = parseDate(start);
    const endDate = parseDate(end);

    if (!startDate || !endDate) {
        return res.status(400).send("Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM");
    }

    const event = {
        title,
        description: description || "",
        start: startDate,
        end: endDate,
        location: location || "",
    };

    createEvent(event, (error, value) => {
        if (error) {
            return res.status(500).send("Error generating ICS file");
        }

        const safeTitle = title.replace(/[^\w.-]/g, "_"); // Sanitize filename
        res.setHeader("Content-Type", "text/calendar");
        res.setHeader("Content-Disposition", `attachment; filename=${safeTitle}.ics`);
        res.send(value);
    });
});

export default router;
