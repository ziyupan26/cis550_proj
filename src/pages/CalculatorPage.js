import React, { useState, useEffect } from 'react';
import { AppBar, Box, Container, Toolbar, Typography,Grid,Paper,Stack,TextField,Button,Select,MenuItem } from '@mui/material'
import { styled } from '@mui/material/styles';
import {calculateNutrition} from '../helpers/api.js'

const nutritionTypeList = ['energyKcal','proteinG','saturatedFatsG'];
export default function CalculatorPage() {
	
	const [type, setType] = React.useState('energyKcal');
	const [ingre,setIngre] = React.useState('');
	const [nutritions,setNutritions]=useState([]);
	  const handleChange = (event) => {
	    setType(event.target.value);
	  };
	  const handleIngreChanged = (event)=>{
		setIngre(event.target.value);
	  };
	  
	  useEffect(() => {
	  		
	  	}, []);
	
	const cal = ()=>{
		calculateNutrition(type,ingre).then((res)=>{
			
		})
	}
	
  return (
  <Box sx={{ width: '60%',marginLeft:'20%',marginTop:'300px'}}>

        <Stack spacing={2}>
         
  		 <Select
  		           labelId="demo-simple-select-label"
  		           id="demo-simple-select"
  		           value={type}
  		           label="Nutrition Type"
  		           onChange={handleChange}
  		         >
				  {nutritionTypeList.map(item => (
						   <MenuItem value={item}>{item}</MenuItem>
				         ))}
  		         </Select>
  		 <TextField id="outlined-basic" label="Enter the ingredients you want to calculate" variant="outlined" value={ingre} onChange={handleIngreChanged} />
		 <Button variant="contained" sx={{width:'200px'}} onClick={cal}>Calculate</Button>
        </Stack>
      </Box>
  );
  }
