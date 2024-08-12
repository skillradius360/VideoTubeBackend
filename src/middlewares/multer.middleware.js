import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
  })
  
 const upload = multer({storage })
export {upload}

// USED FOR NAMING THE FILE NAMES RANDOMLY TO AVOID DIRTY WRITE
//   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//       