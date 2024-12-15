import { useEffect, useState } from 'react';
import { Divider, Box, Container } from '@mui/material';
import { NavLink } from 'react-router-dom';

const config = require('../config.json');

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/category_tops`)
      .then(res => res.json())
      .then(resJson => {
        console.log('Fetched Categories:', resJson);
        setCategories(resJson);
      })
      .catch(err => console.error('Fetch error:', err));

      // Set the page title for the Category page
      document.title = 'Categories - Recipe Finder'; // Set title once when component mounts
 
  }, []);

  const format3 = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' };

  const boxStyle = {
    width: '250px',      // Fixed width for each box
    height: '300px',     // Fixed height for each box
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between', // Distributes space evenly
    // background: '#f3d2a7ff',
    // borderRadius: '16px',
    // border: '2px solid #000',
    margin: '16px',
    padding: '16px',
    overflow: 'hidden', // Prevents content from spilling out
  };

  const imageStyle = {
    width: '200px',     // Fixed width
    height: '200px',    // Fixed height
    objectFit: 'cover', // Ensures image covers the area without distortion
    // borderRadius: '16px',
  };

  const DEFAULT_IMAGE = 'https://i.ibb.co/W5WM4v8/maskable-icon-removebg-preview.png';

  const getImageSrc = (url) => {
    // Check if url is undefined, null, or an empty string
    return (url && url.trim() !== '') ? url : DEFAULT_IMAGE;
  };

  return (
    <Container style={format3}>
      {categories.map((category) =>
        <Box
          key={category.recipecategory}
          p={3}
          m={2}
          style={boxStyle}
        >
          <img
            key={category.recipecategory}
            src={getImageSrc(category.url)}
            alt={`${category.recipecategory} recipe art`}
            style={imageStyle}
            // onError={handleImageError}
          />
          <h4>
            <NavLink 
              to={`/category_info/${category.recipecategory}`} 
              style={({ isActive }) => ({
                color: "black",
                textDecoration: "none",
              })}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
                e.currentTarget.style.textDecorationColor = "red"; // Change underline color here
              }}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
            >
              {category.recipecategory}
            </NavLink>
          </h4>
        </Box>
      )}
      <Divider style={{ marginTop: 20, marginBottom: 20 }} />
    </Container>
  );
}



// import { useEffect, useState } from 'react';
// import { Box, Container, Button } from '@mui/material';
// import { NavLink } from 'react-router-dom';

// const config = require('../config.json');

// export default function CategoryPage() {
//   const [categories, setCategories] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8; // Number of items per page

//   useEffect(() => {
//     fetch(`http://${config.server_host}:${config.server_port}/category_tops`)
//       .then(res => res.json())
//       .then(resJson => {
//         console.log('Fetched Categories:', resJson);
//         setCategories(resJson);
//       })
//       .catch(err => console.error('Fetch error:', err));

//     // Set the page title for the Category page
//     document.title = 'Categories - Recipe Finder'; // Set title once when component mounts
//   }, []);

//   const format3 = { display: 'flex', flexDirection: 'column', alignItems: 'center' };

//   const boxContainerStyle = { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', width: '100%' };

//   const boxStyle = {
//     width: '250px',
//     height: '300px',
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     // background: '#f3d2a7ff',
//     // borderRadius: '16px',
//     // border: '2px solid #000',
//     margin: '16px',
//     padding: '16px',
//     overflow: 'hidden',
//   };

//   const imageStyle = {
//     width: '200px',
//     height: '200px',
//     objectFit: 'cover',
//     // borderRadius: '16px',
//   };

//   const DEFAULT_IMAGE = 'https://i.ibb.co/W5WM4v8/maskable-icon-removebg-preview.png';

//   const getImageSrc = (url) => {
//     return url && url.trim() !== '' ? url : DEFAULT_IMAGE;
//   };

//   const totalPages = Math.ceil(categories.length / itemsPerPage);

//   const handlePageChange = (direction) => {
//     setCurrentPage((prevPage) => {
//       if (direction === 'next') {
//         return Math.min(prevPage + 1, totalPages);
//       } else {
//         return Math.max(prevPage - 1, 1);
//       }
//     });
//   };

//   const currentItems = categories.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   return (
//     <Container style={format3}>
//       <div style={boxContainerStyle}>
//         {currentItems.map((category) => (
//           <Box
//             key={category.recipecategory}
//             p={3}
//             m={2}
//             style={boxStyle}
//           >
//             <img
//               src={getImageSrc(category.url)}
//               alt={`${category.recipecategory} recipe art`}
//               style={imageStyle}
//             />
//             <h4>
//             <NavLink 
//               to={`/category_info/${category.recipecategory}`} 
//               style={({ isActive }) => ({
//                 color: "black",
//                 textDecoration: "none",
//               })}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.textDecoration = "underline";
//                 e.currentTarget.style.textDecorationColor = "red"; // Change underline color here
//               }}
//               onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
//             >
//               {category.recipecategory}
//             </NavLink>

//             </h4>
//           </Box>
//         ))}
//       </div>
//       <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
//         <Button
//           variant="contained"
//           disabled={currentPage === 1}
//           onClick={() => handlePageChange('prev')}
//           style={{ marginRight: '10px' }}
//         >
//           Previous
//         </Button>
//         <Button
//           variant="contained"
//           disabled={currentPage === totalPages}
//           onClick={() => handlePageChange('next')}
//         >
//           Next
//         </Button>
//       </div>
//       <p>Page {currentPage} of {totalPages}</p>
//     </Container>
//   );
// }