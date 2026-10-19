import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <main className="single-page">
      <section className="card contact-card">
        <h2>Contact</h2>
        <p className="skills-copy">
          Enter your details below to see controlled React inputs update the page in real time.
        </p>

        <div className="contact-field">
          <label className="contact-label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="contact-input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
        </div>

        <div className="contact-field">
          <label className="contact-label" htmlFor="contact">
            Contact
          </label>
          <input
            id="contact"
            className="contact-input"
            type="tel"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Enter your contact number"
          />
        </div>

        <div className="contact-field">
          <label className="contact-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="contact-input"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
        </div>

        <div className="live-preview">
          <h3>Live Preview</h3>
          <p>Name: {formData.name || "Not entered"}</p>
          <p>Contact: {formData.contact || "Not entered"}</p>
          <p>Email: {formData.email || "Not entered"}</p>
        </div>
      </section>
    </main>
  );
}

export default Contact;
