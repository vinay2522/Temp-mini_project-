import React from 'react';
import { motion } from 'framer-motion';
import { FaCalendar, FaUser } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Section from './Section';

const BlogPost = ({ title, date, author, excerpt }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="p-4 md:p-6 bg-white text-black rounded-md shadow-md flex flex-col hover:shadow-lg transition-shadow duration-300"
      whileHover={{ scale: 1.05 }}
    >
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 truncate">{title}</h2>
      <div className="text-xs md:text-sm text-gray-600 flex flex-wrap items-center gap-2 md:gap-4 mb-4">
        <span className="flex items-center"><FaCalendar className="text-gray-500 mr-1" /> {date}</span>
        <span className="flex items-center"><FaUser className="text-gray-500 mr-1" /> {author}</span>
      </div>
      <p className="text-sm md:text-base mb-4 line-clamp-3">{excerpt}</p>
      <a
        href="#"
        className="text-blue-500 hover:text-blue-700 underline transition-colors duration-200 self-start mt-auto"
      >
        {t('blog.readMore')}
      </a>
    </motion.div>
  );
};

const Blog = () => {
  const { t } = useTranslation();

  const blogPosts = [
    {
      title: t('blog.post1'),
      date: '2023-05-15',
      author: 'Dr. John Doe',
      excerpt: t('blog.post1.excerpt'),
    },
    {
      title: t('blog.post2'),
      date: '2023-04-28',
      author: 'Jane Smith',
      excerpt: t('blog.post2.excerpt'),
    },
    {
      title: t('blog.post3'),
      date: '2023-04-10',
      author: 'Mike Johnson',
      excerpt: t('blog.post3.excerpt'),
    },
  ];

  return (
    <Section title={t('blog.title')} id="blog">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post, index) => (
          <BlogPost key={index} {...post} />
        ))}
      </div>
    </Section>
  );
};

export default Blog;

