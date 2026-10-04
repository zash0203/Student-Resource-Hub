import "dotenv/config";
import mongoose from "mongoose";
import Category from "./models/Category.js";
import Resource from "./models/Resource.js";

const catalog = [
  {
    name: "Courses & Study Resources",
    slug: "courses",
    emoji: "📚",
    description: "General study help, note-sharing, and course material that isn't tied to one specific program.",
    resources: [
      ["TMU Library Course Guides", "https://library.torontomu.ca/subjects/", "Subject-specific research guides curated by TMU librarians for most departments.", "Official"],
      ["Khan Academy", "https://www.khanacademy.org/", "Free video lessons for math, stats, and science fundamentals — good for filling gaps before exams.", "Free"],
      ["Quizlet", "https://quizlet.com/", "Flashcards and practice tests; search by course code to find sets other students have shared.", "Community"],
      ["OneClass / Course Hero", "https://oneclass.com/", "Crowd-sourced lecture notes and past assignments — verify accuracy before relying on them.", "Community"],
      ["D2L Brightspace", "https://courses.torontomu.ca/", "TMU's official learning management system for course content, grades, and announcements.", "Official"]
    ]
  },
  {
    name: "Coding Practice & CS Resources",
    slug: "coding",
    emoji: "💻",
    description: "Practice platforms and references for computer science and programming courses.",
    resources: [
      ["LeetCode", "https://leetcode.com/", "The standard for practicing coding interview questions and data structures & algorithms.", "Free tier"],
      ["HackerRank", "https://www.hackerrank.com/", "Beginner-friendly coding challenges organized by topic and difficulty.", "Free"],
      ["MDN Web Docs", "https://developer.mozilla.org/", "The most reliable reference for HTML, CSS, and JavaScript syntax and behaviour.", "Reference"],
      ["CS50 (Harvard, free)", "https://cs50.harvard.edu/x/", "A full, free introductory computer science course — useful as a second explanation of first-year material.", "Free course"],
      ["GitHub Student Developer Pack", "https://education.github.com/pack", "Free access to developer tools, hosting, and software with a valid .torontomu.ca email.", "Student perk"]
    ]
  },
  {
    name: "Career & Internship Resources",
    slug: "career",
    emoji: "🎓",
    description: "Where to look for co-ops, internships, and full-time roles, plus help with applications.",
    resources: [
      ["TMU Career Boost", "https://www.torontomu.ca/career-boost/", "TMU's official career centre: resume reviews, mock interviews, and job postings.", "Official"],
      ["RAMSS", "https://www.torontomu.ca/currentstudents/", "Student portal used for course registration and some co-op/work-term postings.", "Official"],
      ["LinkedIn Learning", "https://www.linkedin.com/learning/", "Free with a TMU library login — short courses on technical and professional skills.", "Free w/ TMU login"],
      ["Levels.fyi / Glassdoor", "https://www.levels.fyi/", "Compare compensation and read interview experiences before accepting an offer.", "Reference"]
    ]
  },
  {
    name: "Study Planning Tools",
    slug: "planning",
    emoji: "📅",
    description: "Tools for organizing deadlines, notes, and a weekly study schedule.",
    resources: [
      ["Notion", "https://www.notion.com/", "Free for students — a flexible workspace for notes, trackers, and semester planning.", "Free for students"],
      ["Google Calendar", "https://calendar.google.com/", "Block out study sessions and deadlines; works well alongside your syllabus.", "Free"],
      ["Forest / Focus To-Do", "https://www.forestapp.cc/", "Simple Pomodoro-style timers for building focused study blocks.", "Free"],
      ["Todoist", "https://todoist.com/", "A straightforward task manager for tracking assignments across all your courses.", "Free tier"]
    ]
  }
];

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is required. Copy .env.example to .env and configure MongoDB.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const entry of catalog) {
    const { resources, ...categoryData } = entry;
    const category = await Category.findOneAndUpdate(
      { slug: categoryData.slug },
      categoryData,
      { upsert: true, new: true, runValidators: true }
    );
    for (const [name, url, description, tag] of resources) {
      await Resource.findOneAndUpdate(
        { name, category: category._id },
        { name, url, description, tag, category: category._id },
        { upsert: true, new: true, runValidators: true }
      );
    }
  }
  console.log("Seeded the starter categories and resources.");
} catch (error) {
  console.error("Could not seed the database:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
