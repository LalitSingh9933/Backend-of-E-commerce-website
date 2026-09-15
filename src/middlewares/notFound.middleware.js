const  notFoundHandler = (req, res )=>{
     res. status(404).json({
        success:false,
        message: `Route is not found :${ req.method} ${req.originalUrl}`
     });
};
 export default notFoundHandler;