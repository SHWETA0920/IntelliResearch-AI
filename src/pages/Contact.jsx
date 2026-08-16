import { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/theme.css";

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div>
      <Navbar />
      <div className="container" style={{ marginTop: 60, maxWidth: 520 }}>
        <h1 style={{ fontSize: 38, fontWeight: 800 }}>Contact Us</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 8, marginBottom: 30 }}>
          Questions or feedback? Send us a message.
        </p>

        {sent ? (
          <div className="card">
            <p style={{ margin: 0 }}>Thanks — we'll get back to you soon.</p>
          </div>
        ) : (
          <form
            className="card"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <input placeholder="Your name" required style={fieldStyle} />
            <input placeholder="Your email" type="email" required style={fieldStyle} />
            <textarea placeholder="Message" rows={5} required style={fieldStyle} />
            <button className="btn btn-primary" type="submit">Send Message</button>
          </form>
        )}
      </div>
    </div>
  );
}

const fieldStyle = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  fontSize: 14,
  outline: "none",
};

export default Contact;