from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT = "output/pdf/Aditya_Pareek_Flipkart_UI_Engineer.pdf"
PAGE_WIDTH, _ = letter
DOC_MARGIN = 0.42 * inch
USABLE_WIDTH = PAGE_WIDTH - 2 * DOC_MARGIN

styles = getSampleStyleSheet()
navy = colors.HexColor("#0F172A")
slate = colors.HexColor("#334155")
blue = colors.HexColor("#1D4ED8")

name_style = ParagraphStyle(
    "Name",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=22,
    leading=24,
    alignment=TA_CENTER,
    textColor=navy,
    spaceAfter=1,
)
center_style = ParagraphStyle(
    "Center",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=9.2,
    leading=11,
    alignment=TA_CENTER,
    textColor=slate,
)
section_style = ParagraphStyle(
    "Section",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=11.3,
    leading=12.5,
    textColor=navy,
    spaceBefore=5,
    spaceAfter=1,
)
body_style = ParagraphStyle(
    "Body",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=9.2,
    leading=11.2,
    textColor=slate,
)
small_style = ParagraphStyle(
    "Small",
    parent=body_style,
    fontSize=8.7,
    leading=10.4,
)
bullet_style = ParagraphStyle(
    "Bullet",
    parent=body_style,
    leftIndent=10,
    firstLineIndent=-7,
    bulletIndent=1,
    spaceAfter=2.2,
)
heading_left_style = ParagraphStyle(
    "HeadingLeft",
    parent=body_style,
    fontName="Helvetica-Bold",
    fontSize=9.6,
    leading=11.2,
    textColor=navy,
)
heading_right_style = ParagraphStyle(
    "HeadingRight",
    parent=heading_left_style,
    alignment=2,
)
italic_style = ParagraphStyle(
    "Italic",
    parent=small_style,
    fontName="Helvetica-Oblique",
    textColor=slate,
)


def section(title):
    return [
        Paragraph(title.upper(), section_style),
        HRFlowable(
            width="100%",
            thickness=0.6,
            color=colors.HexColor("#94A3B8"),
            spaceBefore=0,
            spaceAfter=3.5,
        ),
    ]


def two_column(left, right, left_style=heading_left_style, right_style=heading_right_style):
    table = Table(
        [[Paragraph(left, left_style), Paragraph(right, right_style)]],
        colWidths=[USABLE_WIDTH * 0.79, USABLE_WIDTH * 0.21],
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return table


def education(school, dates, degree, gpa):
    return KeepTogether(
        [
            two_column(school, dates),
            two_column(f"<i>{degree}</i>", f"GPA: {gpa}", italic_style, small_style),
            Spacer(1, 2.5),
        ]
    )


def project(name, url, dates, technology, bullets):
    elements = [
        two_column(
            f'{name} | <link href="{url}" color="#1D4ED8">GitHub</link>',
            dates,
        ),
        Paragraph(technology, italic_style),
        Spacer(1, 0.6),
    ]
    elements.extend(Paragraph(f"- {bullet}", bullet_style) for bullet in bullets)
    elements.append(Spacer(1, 2.2))
    return KeepTogether(elements)


def build():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=letter,
        leftMargin=DOC_MARGIN,
        rightMargin=DOC_MARGIN,
        topMargin=0.3 * inch,
        bottomMargin=0.3 * inch,
        title="Aditya Pareek - Flipkart UI Engineer Resume",
        author="Aditya Pareek",
        subject="Application resume for UI Engineer",
    )

    story = [
        Paragraph("Aditya Pareek", name_style),
        Paragraph(
            "International Institute of Information Technology Bangalore",
            center_style,
        ),
        Paragraph(
            '7297958039 &nbsp;|&nbsp; '
            '<link href="mailto:pareekaditya01@gmail.com" color="#1D4ED8">'
            "pareekaditya01@gmail.com</link> &nbsp;|&nbsp; "
            '<link href="https://github.com/Aditya01237" color="#1D4ED8">'
            "github.com/Aditya01237</link>",
            center_style,
        ),
        Spacer(1, 2),
    ]

    story.extend(section("Education"))
    story.append(
        education(
            "International Institute of Information Technology Bangalore",
            "Aug 2025 - Present",
            "M.Tech. in Computer Science &amp; Engineering",
            "3.45 / 4.00",
        )
    )
    story.append(
        education(
            "Manipal University Jaipur",
            "Aug 2020 - May 2024",
            "B.Tech. in Computer Science &amp; Engineering",
            "3.44 / 4.00",
        )
    )

    story.extend(section("Projects"))
    story.append(
        project(
            "CodeForge",
            "https://github.com/Aditya01237/CodeForge",
            "Jun 2026 - Jul 2026",
            "React, JavaScript, Tailwind CSS, Monaco Editor, Spring Boot, Go, MySQL, Redis, Docker",
            [
                "Built a <b>full-stack coding assessment platform</b> with distinct student and faculty workflows for DSA practice, timed assessments, problem authoring, submissions, and result analysis.",
                "Engineered a <b>LeetCode-style React workspace</b> with Monaco Editor, resizable problem/editor/console panels, C++/Java/Python switching, custom input, themes, and per-problem/per-language code persistence.",
                "Developed reusable problem discovery and assessment interfaces, integrated REST workflows with loading/error/expiry handling, and added lint, unit-test, and production-build quality gates.",
            ],
        )
    )
    story.append(
        project(
            "ChunkCrafter",
            "https://github.com/Aditya01237/Custom-E-Book",
            "Mar 2026 - May 2026",
            "React, JavaScript, Tailwind CSS, Java, Spring Boot, Gemini API, PDFBox, FFmpeg",
            [
                "Built a <b>full-stack ed-tech marketplace</b> where authors publish PDF, video, audio, image, and text chunks and students assemble personalized e-books.",
                "Implemented AI-assisted chapter detection with Gemini, virtual media extraction using PDFBox/FFmpeg, and standards-compliant EPUB export with embedded media and study notes.",
            ],
        )
    )
    story.append(
        project(
            "SwasthyaSetu",
            "https://github.com/Aditya01237/SwasthyaSetu",
            "Mar 2026 - May 2026",
            "React, Java, Spring Boot, PostgreSQL, RabbitMQ, Redis, Docker, Kubernetes",
            [
                "Designed a React healthcare platform backed by Spring Boot microservices for authentication, patients, hospitals, appointments, notifications, and API routing.",
                "Implemented OTP authentication, QR-based time-bound record access, Redis locks for appointment concurrency, and containerized deployment with Docker and Kubernetes.",
            ],
        )
    )

    story.extend(section("Technical Skills"))
    for line in [
        "<b>Languages:</b> JavaScript, Java, C++, C",
        "<b>Frontend:</b> React, HTML5, CSS3, Tailwind CSS, Vite, React Router, Monaco Editor",
        "<b>Backend &amp; Data:</b> Spring Boot, REST APIs, PostgreSQL, MySQL, Redis, RabbitMQ",
        "<b>Tools &amp; Concepts:</b> Git, Docker, Linux, Data Structures &amp; Algorithms, Scalable Application Design",
    ]:
        story.append(Paragraph(line, body_style))

    story.extend(section("Awards & Achievements"))
    story.append(
        Paragraph(
            "- Secured <b>All India Rank 648</b> in GATE 2025 (Computer Science &amp; Engineering), placing in the top 0.5% among approximately 1.6 lakh candidates.",
            bullet_style,
        )
    )
    story.append(
        Paragraph(
            "- Earned the <b>Knight badge on LeetCode</b> with a contest rating of <b>1876</b>.",
            bullet_style,
        )
    )

    doc.build(story)


if __name__ == "__main__":
    build()
