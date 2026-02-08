import os
import resend
from dotenv import load_dotenv

load_dotenv()

# Initialize Resend with API key
resend.api_key = os.environ.get("RESEND_API_KEY")


def send_welcome_email(to_email: str, user_name: str, destinations: list = None):
    """
    Send a welcome email when a user subscribes to the newsletter.
    Optionally includes personalized destinations based on user's saved tags.

    Args:
        to_email: Recipient email address
        user_name: Recipient's name
        destinations: Optional list of personalized destination dictionaries
    """
    try:
        # Build destination cards HTML if destinations are provided
        destination_cards = ""
        if destinations and len(destinations) > 0:
            destination_cards = """
                <div style="margin: 30px 0;">
                    <h2 style="font-size: 20px; color: #0f172a; margin-bottom: 20px; font-family: Georgia, serif;">
                        Here are some destinations we think you'll love:
                    </h2>
            """
            for dest in destinations[:4]:  # Limit to 4 destinations
                destination_cards += f"""
                    <div style="margin-bottom: 20px; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                        <img src="{dest.get('image_url', '')}" alt="{dest.get('name', '')}"
                             style="width: 100%; height: 180px; object-fit: cover;">
                        <div style="padding: 16px;">
                            <p style="font-size: 11px; color: #10b981; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0;">
                                {dest.get('location', '')}
                            </p>
                            <h3 style="font-size: 18px; color: #0f172a; margin: 0 0 10px 0; font-family: Georgia, serif;">
                                {dest.get('name', '')}
                            </h3>
                            <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">
                                {dest.get('description', '')[:120]}...
                            </p>
                        </div>
                    </div>
                """
            destination_cards += "</div>"

        intro_text = (
            "You're now subscribed to our weekly newsletter. Every week, we'll send you "
            "handpicked travel destinations tailored to your interests."
        )
        if destinations and len(destinations) > 0:
            intro_text = (
                "You're now subscribed to our weekly newsletter! Based on your saved destinations, "
                "we've already found some places we think you'll love."
            )

        params = {
            "from": "Voyager <noreply@voyager-travel.org>",  # Update with your verified domain
            "to": [to_email],
            "subject": "Welcome to Voyager's Weekly Destinations!",
            "html": f"""
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <h1 style="font-size: 32px; color: #0f172a; margin-bottom: 20px; font-family: Georgia, serif;">
                        Welcome to Voyager, {user_name}!
                    </h1>

                    <p style="font-size: 16px; color: #64748b; line-height: 1.6; margin-bottom: 20px;">
                        {intro_text}
                    </p>

                    {destination_cards}

                    <p style="font-size: 16px; color: #64748b; line-height: 1.6; margin-bottom: 30px;">
                        Get ready to discover your next adventure!
                    </p>

                    <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                        <p style="font-size: 14px; color: #94a3b8;">
                            Happy travels,<br>
                            The Voyager Team
                        </p>
                    </div>
                </div>
            """
        }

        email = resend.Emails.send(params)
        print(f"✅ Welcome email sent to {to_email}")
        return email

    except Exception as e:
        print(f"❌ Failed to send welcome email: {e}")
        return None


def send_weekly_newsletter(to_email: str, user_name: str, destinations: list):
    """
    Send the weekly newsletter with personalized destinations.

    Args:
        to_email: Recipient email address
        user_name: Recipient's name
        destinations: List of destination dictionaries with name, location, description, imageUrl
    """
    try:
        # Build destination cards HTML
        destination_cards = ""
        for dest in destinations[:4]:  # Limit to 4 destinations
            destination_cards += f"""
                <div style="margin-bottom: 30px; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <img src="{dest.get('image_url', '')}" alt="{dest.get('name', '')}"
                         style="width: 100%; height: 200px; object-fit: cover;">
                    <div style="padding: 20px;">
                        <p style="font-size: 12px; color: #10b981; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                            {dest.get('location', '')}
                        </p>
                        <h3 style="font-size: 20px; color: #0f172a; margin: 0 0 12px 0; font-family: Georgia, serif;">
                            {dest.get('name', '')}
                        </h3>
                        <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0;">
                            {dest.get('description', '')[:150]}...
                        </p>
                    </div>
                </div>
            """

        params = {
            "from": "Voyager <onboarding@resend.dev>",  # Update with your verified domain
            "to": [to_email],
            "subject": "Your Weekly Travel Inspiration ✈️",
            "html": f"""
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h1 style="font-size: 28px; color: #0f172a; margin-bottom: 10px; font-family: Georgia, serif;">
                            Voyager Weekly
                        </h1>
                        <p style="font-size: 14px; color: #64748b;">
                            Your personalized travel destinations
                        </p>
                    </div>

                    <p style="font-size: 16px; color: #334155; line-height: 1.6; margin-bottom: 30px;">
                        Hi {user_name},<br><br>
                        Here are this week's handpicked destinations just for you:
                    </p>

                    {destination_cards}

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="https://yourdomain.com"
                           style="display: inline-block; background-color: #0f172a; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 500;">
                            Explore More Destinations
                        </a>
                    </div>

                    <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; text-align: center;">
                        <p style="font-size: 12px; color: #94a3b8;">
                            You're receiving this because you subscribed to Voyager's newsletter.<br>
                            <a href="#" style="color: #94a3b8;">Unsubscribe</a>
                        </p>
                    </div>
                </div>
            """
        }

        email = resend.Emails.send(params)
        print(f"✅ Weekly newsletter sent to {to_email}")
        return email

    except Exception as e:
        print(f"❌ Failed to send weekly newsletter: {e}")
        return None
