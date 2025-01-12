import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendar, FaUser, FaSearch, FaTags, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Section from './Section';

const BlogPost = ({ title, date, author, excerpt, category, imageUrl, slug }) => {
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate(`/blog/${slug}`);
  };

  return (
    <motion.div
      className="p-4 md:p-6 bg-white text-black rounded-lg shadow-md flex flex-col hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.02 }}
    >
      {imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img src={imageUrl} alt={title} className="w-full h-48 object-cover" loading="lazy" />
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">{category}</span>
      </div>
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 hover:text-blue-600 transition-colors duration-200">{title}</h2>
      <div className="text-xs md:text-sm text-gray-600 flex flex-wrap items-center gap-2 md:gap-4 mb-4">
        <span className="flex items-center"><FaCalendar className="text-gray-500 mr-1" /> {date}</span>
        <span className="flex items-center"><FaUser className="text-gray-500 mr-1" /> {author}</span>
      </div>
      <p className="text-sm md:text-base mb-4 line-clamp-3 text-gray-700">{excerpt}</p>
      <button
        onClick={handleReadMore}
        className="text-blue-500 hover:text-blue-700 font-medium transition-colors duration-200 self-start mt-auto flex items-center gap-1"
      >
        Read More →
      </button>
    </motion.div>
  );
};

const SearchBar = ({ onSearch }) => {
  return (
    <div className="relative mb-6">
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search articles by title or content..."
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
          !selectedCategory ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => onSelectCategory(null)}
      >
        All Topics
      </button>
      {categories.map((category) => (
        <button
          key={category}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
            selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FaChevronLeft className="text-gray-600" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          className={`w-8 h-8 rounded-full ${
            currentPage === page
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <FaChevronRight className="text-gray-600" />
      </button>
    </div>
  );
};

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const blogPosts = [
    {
      title: "Understanding Blood Donation: A Comprehensive Guide",
      date: "2024-01-04",
      author: "Dr. Sarah Johnson",
      excerpt: "Learn about the importance of blood donation, eligibility criteria, and how your contribution can save lives. Discover the different types of blood donations and the impact they have on patient care.",
      category: "Blood Donation",
      imageUrl: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop&q=60",
      slug: "understanding-blood-donation"
    },
    {
      title: "Emergency Medical Transport: What You Need to Know",
      date: "2024-01-02",
      author: "James Wilson",
      excerpt: "A detailed guide on emergency medical transport services, when to call for help, what to expect, and how to prepare for medical emergencies. Essential information for everyone.",
      category: "Emergency Services",
      imageUrl: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800&auto=format&fit=crop&q=60",
      slug: "emergency-medical-transport-guide"
    },
    {
      title: "Telemedicine: The Future of Healthcare Consultation",
      date: "2023-12-28",
      author: "Dr. Emily Chen",
      excerpt: "Explore how telemedicine is revolutionizing healthcare delivery, its benefits, and how to make the most of your virtual consultations. Tips for effective online medical appointments.",
      category: "Telehealth",
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60",
      slug: "telemedicine-future-healthcare"
    },
    {
      title: "Mental Health Support: Breaking the Stigma",
      date: "2023-12-25",
      author: "Dr. Michael Brooks",
      excerpt: "Understanding the importance of mental health support, available resources, and how to seek help. Learn about common mental health challenges and coping strategies.",
      category: "Mental Health",
      imageUrl: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=800&auto=format&fit=crop&q=60",
      slug: "mental-health-support"
    },
    {
      title: "Preventive Healthcare: Your Guide to Wellness",
      date: "2023-12-20",
      author: "Dr. Lisa Martinez",
      excerpt: "Discover essential preventive healthcare measures, recommended screenings, and lifestyle changes for maintaining optimal health. Prevention is better than cure.",
      category: "Wellness",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=60",
      slug: "preventive-healthcare-guide"
    },
    {
      title: "Community Health Initiatives: Making a Difference",
      date: "2023-12-15",
      author: "Rachel Thompson",
      excerpt: "Learn about various community health programs, their impact, and how you can get involved. Discover how local initiatives are improving public health outcomes.",
      category: "Community",
      imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=60",
      slug: "community-health-initiatives"
    },
    {
      title: "First Aid Essentials: Be Prepared",
      date: "2023-12-10",
      author: "Dr. Robert Clark",
      excerpt: "A comprehensive guide to basic first aid skills, essential supplies, and emergency response procedures. Learn how to handle common medical emergencies.",
      category: "Emergency Services",
      imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&auto=format&fit=crop&q=60",
      slug: "first-aid-essentials"
    },
    {
      title: "Understanding Medical Insurance Coverage",
      date: "2023-12-05",
      author: "Amanda Foster",
      excerpt: "Navigate the complexities of medical insurance, understand coverage options, and learn how to maximize your benefits. Essential information for healthcare planning.",
      category: "Healthcare",
      imageUrl: "https://images.unsplash.com/photo-1563213126-a4273aed2016?w=800&auto=format&fit=crop&q=60",
      slug: "understanding-medical-insurance"
    }
  ];

  const categories = [
    'Blood Donation',
    'Emergency Services',
    'Telehealth',
    'Mental Health',
    'Wellness',
    'Community',
    'Healthcare'
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <Section title="Healthcare Insights & Updates" id="blog">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Latest Articles & Resources
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest healthcare insights, medical advances, and community initiatives. 
            Our expert-written articles provide valuable information to help you make informed decisions about your health.
          </p>
        </div>
        
        <SearchBar onSearch={setSearchQuery} />
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        
        {currentPosts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">No articles found matching your criteria</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPosts.map((post, index) => (
              <BlogPost key={index} {...post} />
            ))}
          </div>
        )}
        
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </Section>
  );
};

export default Blog;
