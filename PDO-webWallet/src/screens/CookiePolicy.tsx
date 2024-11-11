import React from "react";
import Typography from "@mui/material/Typography";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

const CookiePolicy: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(-1); // Navigate back one step
  };

  return (
    <Box
      display="flex"
      flexDirection={"column"}
      height="100vh"
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Paper
        sx={{
          padding: 5,
          width: "70%",

          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" align="center">
          Cookie Policy
        </Typography>
        <Typography variant="body1" align="left" py={4}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
          suscipit nunc sit amet nulla dignissim mattis. Vestibulum bibendum
          feugiat posuere. Praesent ac leo blandit, molestie arcu ut, eleifend
          tortor. Sed vel magna quam. Donec et iaculis dui. Mauris eleifend
          felis nibh. Vestibulum rhoncus finibus metus non dapibus. Etiam quis
          diam magna. Vestibulum ut malesuada arcu, id rutrum nulla. Nam
          fringilla faucibus ullamcorper. Curabitur quis lacus elementum,
          elementum dui hendrerit, iaculis elit. Mauris eget semper elit. Duis
          sagittis metus vel tincidunt elementum. Curabitur aliquet ante a felis
          efficitur, non consequat mauris tincidunt. Duis tempus dolor vitae
          neque mattis, et finibus mi scelerisque. Proin elementum id risus eget
          vestibulum. Sed nec neque neque. Pellentesque dapibus placerat
          consequat. Pellentesque mattis fringilla erat. Vestibulum suscipit
          lacinia massa ut tristique. Pellentesque orci turpis, aliquet quis
          ullamcorper at, interdum et sapien. Pellentesque interdum quam ipsum,
          quis mollis eros fermentum in. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit.
        </Typography>
        <Link to="#" onClick={handleGoBack}>
          Go Back{" "}
        </Link>
      </Paper>
    </Box>
  );
};

export default CookiePolicy;
