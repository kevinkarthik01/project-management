import React from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="constant-footer">
            <div className="footer-left">
                <div className="footer-brand">
                    <img
                        src="/logo.png"
                        alt="Impactory"
                        style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <span>Impactory</span>
                </div>
                <span>&copy; {currentYear} Impactory Inc. All rights reserved.</span>

                {/* System Status Pill */}
                <div className="footer-status-pill">
                    <span className="footer-status-dot"></span>
                    <span>Systems Normal</span>
                </div>
            </div>

            {/* <div className="footer-links">
                <a href="#docs" className="footer-link">Documentation</a>
                <a href="#privacy" className="footer-link">Privacy Policy</a>
                <a href="#terms" className="footer-link">Terms</a>
                <a href="#support" className="footer-link">Support</a>
                <span className="footer-version">v1.2.0</span>
            </div> */}
        </footer>
    );
}
