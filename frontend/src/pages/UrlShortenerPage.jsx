import React, { useState } from 'react';
import { TextField, Button, Grid, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { log } from '../logging-middleware/log'; // Import your logging middleware

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const generateShortcode = (existing) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (existing.includes(code));
  return code;
};

const UrlShortenerPage = () => {
  const [urls, setUrls] = useState([{ originalUrl: '', validity: '', shortcode: '', errors: {} }]);
  const [shortenedUrls, setShortenedUrls] = useState([]);

  const addRow = () => {
    if (urls.length < 5) {
      setUrls([...urls, { originalUrl: '', validity: '', shortcode: '', errors: {} }]);
    }
  };

  const handleChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    newUrls[index].errors[field] = null; // Clear error on change
    setUrls(newUrls);
  };

  const validateInputs = () => {
    let isValid = true;
    const newUrls = [...urls];

    // Collect existing shortcodes to check uniqueness
    const existingShortcodes = urls.map(u => u.shortcode).filter(sc => sc);

    urls.forEach((urlData, idx) => {
      const errors = {};

      // Validate originalUrl
      if (!urlData.originalUrl || !validateUrl(urlData.originalUrl.trim())) {
        errors.originalUrl = 'Enter a valid URL';
        isValid = false;
      }

      // Validate validity (optional, default 30 if empty)
      if (urlData.validity) {
        if (!Number.isInteger(Number(urlData.validity)) || Number(urlData.validity) <= 0) {
          errors.validity = 'Enter a positive integer';
          isValid = false;
        }
      }

      // Validate shortcode (optional)
      const sc = urlData.shortcode.trim();
      if (sc) {
        if (!/^[a-zA-Z0-9]{4,10}$/.test(sc)) {
          errors.shortcode = 'Alphanumeric, 4-10 chars';
          isValid = false;
        }
        // Check uniqueness within input batch
        if (existingShortcodes.indexOf(sc) !== idx) {
          errors.shortcode = 'Duplicate shortcode';
          isValid = false;
        }
      }

      newUrls[idx].errors = errors;
    });

    setUrls(newUrls);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) {
      await log("frontend", "warn", "component", "Validation failed on URL Shortener form submit.");
      return;
    }

    await log("frontend", "info", "component", "URL Shortener form validation succeeded.");

    const existingShortcodes = shortenedUrls.map(su => su.shortcode);

    const toShorten = urls.map(urlData => {
      const originalUrl = urlData.originalUrl.trim();
      const validityMinutes = urlData.validity ? Number(urlData.validity) : 30;
      let shortcode = urlData.shortcode.trim();

      if (!shortcode) {
        // Generate unique shortcode
        shortcode = generateShortcode(existingShortcodes);
        existingShortcodes.push(shortcode);
      }

      const now = new Date();
      const createdAt = now.toISOString();
      const expiryAt = new Date(now.getTime() + validityMinutes * 60000).toISOString();

      return { originalUrl, validityMinutes, shortcode, createdAt, expiryAt, clickCount: 0, clicks: [] };
    });

    // Add new shortened URLs to state
    setShortenedUrls([...shortenedUrls, ...toShorten]);

    await log("frontend", "info", "component", `Shortened ${toShorten.length} URLs successfully.`);

    alert('URLs shortened successfully!');

    // Reset form
    setUrls([{ originalUrl: '', validity: '', shortcode: '', errors: {} }]);
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 900, margin: 'auto', marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>URL Shortener</Typography>
      {urls.map((urlData, idx) => (
        <Grid container spacing={2} alignItems="center" key={idx} sx={{ marginBottom: 2 }}>
          <Grid item xs={6}>
            <TextField
              required
              label="Original URL"
              value={urlData.originalUrl}
              onChange={(e) => handleChange(idx, 'originalUrl', e.target.value)}
              fullWidth
              error={!!urlData.errors.originalUrl}
              helperText={urlData.errors.originalUrl}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Validity (minutes)"
              value={urlData.validity}
              onChange={(e) => handleChange(idx, 'validity', e.target.value)}
              fullWidth
              type="number"
              inputProps={{ min: 1 }}
              error={!!urlData.errors.validity}
              helperText={urlData.errors.validity}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Custom Shortcode"
              value={urlData.shortcode}
              onChange={(e) => handleChange(idx, 'shortcode', e.target.value)}
              fullWidth
              error={!!urlData.errors.shortcode}
              helperText={urlData.errors.shortcode}
            />
          </Grid>
        </Grid>
      ))}
      <Button onClick={() => urls.length < 5 && setUrls([...urls, { originalUrl: '', validity: '', shortcode: '', errors: {} }])} disabled={urls.length >= 5} variant="outlined" sx={{ marginRight: 2 }}>
        Add URL
      </Button>
      <Button variant="contained" onClick={handleSubmit}>Shorten URLs</Button>

      {shortenedUrls.length > 0 && (
        <>
          <Typography variant="h5" sx={{ marginTop: 4 }}>Shortened URLs</Typography>
          <List>
            {shortenedUrls.map(({ originalUrl, shortcode, createdAt, expiryAt }, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={
                    <>
                      <a href={`http://localhost:3000/${shortcode}`} target="_blank" rel="noopener noreferrer">
                        http://localhost:3000/{shortcode}
                      </a> (expires: {new Date(expiryAt).toLocaleString()})
                    </>
                  }
                  secondary={originalUrl}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
};

export default UrlShortenerPage;
