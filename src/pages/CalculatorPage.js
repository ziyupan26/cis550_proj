import React, { useEffect } from 'react';
import { Box, Stack,TextField,Button,Select,MenuItem,OutlinedInput, Card, CardContent, Typography } from '@mui/material'
import { styled } from '@mui/material/styles';
import {calculateNutrition} from '../helpers/api.js'

const nutritionTypeList = ['energyKcal','proteinG','saturatedFatsG','fatG','carbG','fiberG','sugarG','calciumMg','ironMg','magnesiumMg','phosphorusMg',
'potassiumMg','sodiumMg','zincMg','copperMcg','manganeseMg','seleniumMcg','vitCMg','thiaminMg','riboflavinMg','niacinMg','vitB6Mg',
'folateMcg','vitB12Mcg','vitAMcg','vitEMg','vitD2Mcg'];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
	  backgroudColor:'white',
      width: 250,
    },
  },
};

const ColorButton = styled(Button)(({ theme }) => ({
  color: 'black',
  backgroundColor: 'rgb(255,229,153)',
  borderRadius:'10px',
  '&:hover': {
    backgroundColor:'rgb(255,229,255)',
  },
}));

const ColorSelect = styled(Select)(({ theme }) => ({
  color: 'black',
  backgroundColor: 'rgb(255,242,204)',
  borderRadius:'10px',
  '&:hover': {
    backgroundColor:'rgb(255,229,255)',
  },
}));

const ColorInput = styled(TextField)(({ theme }) => ({
  color: 'black',
  backgroundColor: 'rgb(255,242,204)',
  borderRadius:'10px',
  '&:hover': {
    backgroundColor:'rgb(255,229,255)',
  },
}));



export default function CalculatorPage() {
	
	const [type, setType] = React.useState('');
	const [ingre,setIngre] = React.useState('');
	const [result,setResult] = React.useState("");
	// const [nutritions,setNutritions]=useState([]);
	  const handleChange = (event) => {
	    setType(event.target.value);
	  };
	  const handleIngreChanged = (event)=>{
		setIngre(event.target.value);
	  };
	  
	  useEffect(() => {
	  		
	  	}, []);
	
	const cal = ()=>{
		setResult(0);
		console.log(type,ingre);
		calculateNutrition(type,ingre).then((res)=>{
			console.log(res);
			setResult(res.value);
		})
	}
	
  return (
  <Box sx={{ width: '60%',marginLeft:'20%',marginTop:'200px'}}>

        <Stack spacing={2}>
         
  		 <ColorSelect
				displayEmpty
				input={<OutlinedInput />}
				value={type}
  		        onChange={handleChange}
				MenuProps={MenuProps}
				inputProps={{ 'aria-label': 'Without label' }}
  		         >
				 <MenuItem disabled value="">
				             <em>Select Nutrition Type you want to calculate</em>
				           </MenuItem>
				  {nutritionTypeList.map(item => (
						   <MenuItem value={item}>{item}</MenuItem>
				         ))}
  		         </ColorSelect>
  		 <ColorInput id="outlined-basic" label="Enter the ingredients you want to calculate" variant="outlined" value={ingre} onChange={handleIngreChanged} />
		 <h4 style={{color:'#666666',marginLeft:'50px'}}>Example: blueberries,butter,flour,sugar</h4>
		 <Stack direction="row" spacing={2}  sx={{
			justifyContent: "center",
			alignItems: "center",
		  }}>
			<ColorButton variant="contained" sx={{width:'200px',height:'50px',fontSize:'1.2em'}} onClick={cal}>Calculate</ColorButton>
		 </Stack>
		 <hr/>
		 <Stack direction="row" spacing={2}  sx={{
		 			justifyContent: "center",
		 			alignItems: "center",
		  }}>
		 	<Card sx={{ 
				minWidth: 275,
				backgroundColor: '#FFF8E1',   // card background color 
				color: '#333333',             // text color inside the card
				padding: '16px',              // add some padding if you want 
				}}>
				<CardContent>
					<Typography variant="h6" component="div">
						Nutrition Type: {type}
					</Typography>
					<Typography variant="h6" component="div" sx={{ mt: 3 }}>
						Value: {result}
					</Typography>
				</CardContent>
			</Card>
		 </Stack>
        </Stack>
      </Box>
  );
  }