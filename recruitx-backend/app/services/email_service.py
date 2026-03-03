"""
Email service for RecruitX — uses Gmail SMTP (or any SMTP).
Configure via environment variables in .env file at recruitx-backend/.env
"""
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import threading


def _send_email_now(to_email: str, subject: str, html_body: str):
    """Internal: send one email via SMTP. Reads config at call time."""
    smtp_host     = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port     = int(os.getenv("SMTP_PORT", "587"))
    smtp_user     = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    from_name     = os.getenv("SMTP_FROM_NAME", "RecruitX Placement Cell")

    if not smtp_user or not smtp_password:
        print(f"[EMAIL] SMTP not configured — skipping email to {to_email}")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{from_name} <{smtp_user}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, to_email, msg.as_string())
        print(f"[EMAIL] ✅ Sent to {to_email}: {subject}")
    except Exception as e:
        print(f"[EMAIL] ❌ Failed to send to {to_email}: {e}")


def send_shortlist_email(student_email: str, student_name: str, job_title: str, company_name: str):
    """Send a shortlisting congratulation email."""
    subject = f"🎉 You've been Shortlisted — {job_title} at {company_name}"
    html = f"""
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #818cf8); padding: 36px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 26px; letter-spacing: -0.5px;">Congratulations, {student_name}! 🎉</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0; font-size: 15px;">You've been shortlisted for an exciting opportunity</p>
      </div>
      <div style="padding: 32px;">
        <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">Position</p>
          <p style="color: #f1f5f9; font-size: 20px; font-weight: 800; margin: 0;">{job_title}</p>
          <p style="color: #818cf8; font-size: 14px; font-weight: 600; margin: 4px 0 0;">{company_name}</p>
        </div>
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
          The placement cell has reviewed your profile and selected you as a shortlisted candidate for the above role.
          Please log in to your RecruitX portal to view more details and stay updated on next steps.
        </p>
        <div style="background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); border-radius: 10px; padding: 14px; margin-bottom: 24px;">
          <p style="color: #818cf8; font-size: 13px; margin: 0;">
            ⏰ The placement cell will contact you shortly with further details about the interview schedule and process.
          </p>
        </div>
        <p style="color: #64748b; font-size: 13px; margin: 0;">
          Best of luck!<br/>
          <strong style="color: #94a3b8;">RecruitX Placement Cell</strong>
        </p>
      </div>
    </div>
    """
    _send_email_now(student_email, subject, html)


def send_rejection_email(student_email: str, student_name: str, job_title: str, company_name: str):
    """Send a kind rejection email."""
    subject = f"Update on your application — {job_title} at {company_name}"
    html = f"""
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #1e293b; padding: 36px; text-align: center; border-bottom: 1px solid #334155;">
        <h1 style="color: #f1f5f9; margin: 0; font-size: 24px;">Application Update</h1>
      </div>
      <div style="padding: 32px;">
        <p style="color: #e2e8f0; font-size: 16px; margin: 0 0 16px;">Dear {student_name},</p>
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
          Thank you for your interest in the <strong style="color: #f1f5f9;">{job_title}</strong> position at
          <strong style="color: #f1f5f9;">{company_name}</strong>.
          After careful consideration, the placement cell has decided not to move forward with your application at this time.
        </p>
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
          We encourage you to keep your profile updated and continue applying to other opportunities on RecruitX.
        </p>
        <p style="color: #64748b; font-size: 13px; margin: 0;">
          Best regards,<br/>
          <strong style="color: #94a3b8;">RecruitX Placement Cell</strong>
        </p>
      </div>
    </div>
    """
    _send_email_now(student_email, subject, html)


def schedule_email_after_business_days(days: int, fn, *args):
    """
    Schedule fn(*args) to run after `days` business days.
    One business day ≈ 86400s; skips Sat/Sun.
    For 2 business days from now, calculates the target datetime and
    uses a daemon thread with a sleep.
    """
    now = datetime.now()
    target = now
    added = 0
    while added < days:
        target += timedelta(days=1)
        if target.weekday() < 5:   # Mon–Fri
            added += 1
    delay_seconds = (target - now).total_seconds()

    def _run():
        import time
        time.sleep(delay_seconds)
        fn(*args)

    t = threading.Thread(target=_run, daemon=True)
    t.start()
    print(f"[EMAIL] ⏳ Scheduled email in {delay_seconds/3600:.1f}h (after {days} business days)")
