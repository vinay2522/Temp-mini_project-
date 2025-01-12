import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendar, FaUser, FaTags, FaArrowLeft } from 'react-icons/fa';
import Section from './Section';

const blogData = {
  "understanding-blood-donation": {
    title: "Understanding Blood Donation: A Comprehensive Guide",
    date: "2024-01-04",
    author: "Dr. Sarah Johnson",
    category: "Blood Donation",
    imageUrl: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop&q=60",
    content: `
      <h2>Why Blood Donation Matters</h2>
      <p>Blood donation is a crucial lifeline for many medical treatments and emergency procedures. Every day, thousands of patients require blood transfusions for various medical conditions, surgeries, and emergencies. Your single donation can save up to three lives!</p>

      <h2>Types of Blood Donations</h2>
      <ul>
        <li><strong>Whole Blood Donation:</strong> The most common type of donation, used for trauma and surgery patients.</li>
        <li><strong>Platelet Donation:</strong> Essential for cancer patients and others with clotting problems.</li>
        <li><strong>Plasma Donation:</strong> Used to treat burn victims and patients with liver diseases.</li>
        <li><strong>Double Red Cell Donation:</strong> Beneficial for trauma patients and those with blood disorders.</li>
      </ul>

      <h2>Eligibility Criteria</h2>
      <p>To ensure safe blood donation, donors must meet certain criteria:</p>
      <ul>
        <li>Be at least 18 years old</li>
        <li>Weigh at least 50kg</li>
        <li>Be in good general health</li>
        <li>Have hemoglobin levels within acceptable ranges</li>
        <li>No recent major surgeries or infections</li>
      </ul>

      <h2>The Donation Process</h2>
      <p>The blood donation process is simple and typically takes about 30-45 minutes:</p>
      <ol>
        <li>Registration and basic health check</li>
        <li>Medical history review</li>
        <li>Mini-physical examination</li>
        <li>The actual donation (8-10 minutes)</li>
        <li>Short rest and refreshments</li>
      </ol>

      <h2>After Donation Care</h2>
      <p>To ensure a smooth recovery after donation:</p>
      <ul>
        <li>Drink plenty of fluids</li>
        <li>Avoid strenuous physical activity for 24 hours</li>
        <li>Keep the bandage on for several hours</li>
        <li>Eat well-balanced meals</li>
      </ul>
    `
  },
  "emergency-medical-transport-guide": {
    title: "Emergency Medical Transport: What You Need to Know",
    date: "2024-01-02",
    author: "James Wilson",
    category: "Emergency Services",
    imageUrl: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800&auto=format&fit=crop&q=60",
    content: `
      <h2>Understanding Emergency Medical Transport</h2>
      <p>Emergency medical transport services are critical components of healthcare systems, providing rapid response and transportation during medical emergencies. This guide will help you understand when and how to use these services effectively.</p>

      <h2>When to Call for Emergency Transport</h2>
      <ul>
        <li>Severe chest pain or difficulty breathing</li>
        <li>Stroke symptoms (facial drooping, arm weakness, speech difficulty)</li>
        <li>Severe injuries or trauma</li>
        <li>Loss of consciousness</li>
        <li>Severe allergic reactions</li>
      </ul>

      <h2>Types of Medical Transport</h2>
      <p>Different situations require different types of transport:</p>
      <ul>
        <li><strong>Emergency Ambulance:</strong> For life-threatening emergencies requiring immediate medical attention</li>
        <li><strong>Non-Emergency Transport:</strong> For scheduled medical appointments or transfers</li>
        <li><strong>Air Ambulance:</strong> For critical cases requiring rapid transport or remote locations</li>
      </ul>

      <h2>What to Expect</h2>
      <p>During an emergency transport:</p>
      <ol>
        <li>Initial assessment by EMTs or paramedics</li>
        <li>Immediate life-saving interventions if needed</li>
        <li>Continuous monitoring during transport</li>
        <li>Communication with receiving medical facility</li>
      </ol>

      <h2>How to Prepare</h2>
      <p>Keep these items readily available for emergencies:</p>
      <ul>
        <li>List of current medications</li>
        <li>Important medical history</li>
        <li>Emergency contact information</li>
        <li>Insurance information</li>
        <li>Advance directives if applicable</li>
      </ul>
    `
  },
  "telemedicine-future-healthcare": {
    title: "Telemedicine: The Future of Healthcare Consultation",
    date: "2023-12-28",
    author: "Dr. Emily Chen",
    category: "Telehealth",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60",
    content: `
      <h2>The Rise of Telemedicine</h2>
      <p>Telemedicine has revolutionized healthcare delivery, making medical consultations more accessible and convenient than ever before. This comprehensive guide explores how telemedicine works and how to make the most of virtual healthcare services.</p>

      <h2>Benefits of Telemedicine</h2>
      <ul>
        <li>Convenient access to healthcare from home</li>
        <li>Reduced travel time and costs</li>
        <li>Shorter wait times for appointments</li>
        <li>Access to specialists regardless of location</li>
        <li>Reduced exposure to other illnesses</li>
      </ul>

      <h2>When to Use Telemedicine</h2>
      <p>Telemedicine is suitable for many medical situations:</p>
      <ul>
        <li>Follow-up appointments</li>
        <li>Minor illnesses and conditions</li>
        <li>Mental health consultations</li>
        <li>Prescription refills</li>
        <li>Review of test results</li>
      </ul>

      <h2>Preparing for Your Virtual Visit</h2>
      <ol>
        <li>Test your technology beforehand</li>
        <li>Find a quiet, private space</li>
        <li>Prepare a list of symptoms and questions</li>
        <li>Have your medical history ready</li>
        <li>Keep a pen and paper handy for notes</li>
      </ol>

      <h2>Making the Most of Your Consultation</h2>
      <p>Tips for an effective virtual visit:</p>
      <ul>
        <li>Be specific about your symptoms</li>
        <li>Have any relevant medical devices ready</li>
        <li>Take photos of visible symptoms beforehand if applicable</li>
        <li>Ask questions about follow-up care</li>
        <li>Understand when you need in-person care</li>
      </ul>
    `
  },
  "mental-health-support": {
    title: "Mental Health Support: Breaking the Stigma",
    date: "2023-12-25",
    author: "Dr. Michael Brooks",
    category: "Mental Health",
    imageUrl: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=800&auto=format&fit=crop&q=60",
    content: `
      <h2>Understanding Mental Health</h2>
      <p>Mental health is an essential component of overall well-being that affects how we think, feel, and act. It influences our ability to handle stress, relate to others, and make choices.</p>

      <h2>Common Mental Health Challenges</h2>
      <ul>
        <li>Anxiety disorders</li>
        <li>Depression</li>
        <li>Stress-related conditions</li>
        <li>Sleep disorders</li>
        <li>Mood disorders</li>
      </ul>

      <h2>Seeking Help</h2>
      <p>There are many ways to get support for mental health:</p>
      <ul>
        <li>Professional counseling</li>
        <li>Therapy sessions</li>
        <li>Support groups</li>
        <li>Mental health hotlines</li>
        <li>Online resources and communities</li>
      </ul>

      <h2>Breaking the Stigma</h2>
      <p>Mental health stigma can prevent people from seeking help. Here's how we can break it:</p>
      <ul>
        <li>Open conversations about mental health</li>
        <li>Education and awareness</li>
        <li>Sharing personal experiences</li>
        <li>Supporting others in their journey</li>
      </ul>

      <h2>Self-Care Strategies</h2>
      <p>Important self-care practices for mental health:</p>
      <ul>
        <li>Regular exercise</li>
        <li>Healthy sleep habits</li>
        <li>Balanced nutrition</li>
        <li>Stress management techniques</li>
        <li>Mindfulness and meditation</li>
      </ul>
    `
  },
  "preventive-healthcare-guide": {
    title: "Preventive Healthcare: Your Guide to Wellness",
    date: "2023-12-20",
    author: "Dr. Lisa Martinez",
    category: "Wellness",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=60",
    content: `
      <h2>The Importance of Preventive Healthcare</h2>
      <p>Preventive healthcare focuses on maintaining health and catching potential issues early. It's about taking proactive steps to prevent diseases rather than treating them after they occur.</p>

      <h2>Regular Health Screenings</h2>
      <ul>
        <li>Annual physical examinations</li>
        <li>Blood pressure monitoring</li>
        <li>Cholesterol checks</li>
        <li>Cancer screenings</li>
        <li>Dental check-ups</li>
      </ul>

      <h2>Lifestyle Choices</h2>
      <p>Key lifestyle factors for maintaining health:</p>
      <ul>
        <li>Regular exercise routine</li>
        <li>Balanced nutrition</li>
        <li>Adequate sleep</li>
        <li>Stress management</li>
        <li>Avoiding harmful habits</li>
      </ul>

      <h2>Vaccination Schedule</h2>
      <p>Important vaccinations for adults:</p>
      <ul>
        <li>Annual flu shot</li>
        <li>Tetanus boosters</li>
        <li>Pneumonia vaccine</li>
        <li>Shingles vaccine</li>
        <li>COVID-19 vaccination</li>
      </ul>
    `
  }
  // Add more blog posts here with their full content
};

const BlogPostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = blogData[slug];

  if (!post) {
    return (
      <Section>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog post not found</h2>
          <button
            onClick={() => navigate('/blog')}
            className="text-blue-500 hover:text-blue-700 font-medium flex items-center gap-2 mx-auto"
          >
            <FaArrowLeft /> Back to Blog
          </button>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <article className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/blog')}
          className="text-blue-500 hover:text-blue-700 font-medium flex items-center gap-2 mb-6"
        >
          <FaArrowLeft /> Back to Blog
        </button>

        {post.imageUrl && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-[400px] object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <span className="flex items-center gap-2">
              <FaCalendar /> {post.date}
            </span>
            <span className="flex items-center gap-2">
              <FaUser /> {post.author}
            </span>
            <span className="flex items-center gap-2">
              <FaTags />
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm">
                {post.category}
              </span>
            </span>
          </div>
        </div>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Share this article</h3>
          <div className="flex gap-4">
            {/* Add social sharing buttons here if needed */}
          </div>
        </div>
      </article>
    </Section>
  );
};

export default BlogPostDetail;
