import { useEffect, useState } from 'react';
import { Box, Stack, Button, ButtonGroup, Modal, Tab, Tabs, Typography } from '@mui/material';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis } from 'recharts';

const config = require('../config.json');

export default function IngredientCard({ ingredientName, handleClose }) {
  const [ingredientData, setIngredientData] = useState({});
  const [barRadar, setBarRadar] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/ingredient_info/${ingredientName}`)
      .then(res => res.json())
      .then(data => {
        setIngredientData(data);
      });
  }, [ingredientName]);

  // Non-vitamin attributes: Energy, Protein, Fat, Carbs, Sugar
  const nonVitaminData = [
    { label: 'Energy (kcal)', value: ingredientData.energykcal },
    { label: 'Protein (g)', value: ingredientData.proteing },
    { label: 'Fat (g)', value: ingredientData.fatg },
    { label: 'Carbs (g)', value: ingredientData.carbg },
    { label: 'Sugar (g)', value: ingredientData.sugarg }
  ].filter(item => item.value !== undefined);

  const barData = [
    { label: 'Protein', value: ingredientData.proteing },
    { label: 'Fat', value: ingredientData.fatg },
    { label: 'Carbs', value: ingredientData.carbg },
    { label: 'Sugar', value: ingredientData.sugarg },
    { label: 'Fiber', value: ingredientData.fiberg }
  ].filter(item => item.value !== undefined);

  const maxValue = Math.max(...barData.map(d => d.value));
  const extendedMax = Math.ceil(maxValue * 1.1);

  // Radar chart should only show fiber and all vitamins
  const radarData = [
    { name: 'Fiber', value: ingredientData.fiberg },
    { name: 'Vitamin C', value: ingredientData.vitcmg },
    { name: 'Vitamin B6', value: ingredientData.vitb6mg },
    { name: 'Vitamin B12', value: ingredientData.vitb12mcg },
    { name: 'Vitamin A', value: ingredientData.vitamcg },
    { name: 'Vitamin E', value: ingredientData.vitemg },
    { name: 'Vitamin D2', value: ingredientData.vitd2mcg }
  ].filter(item => item.value !== undefined);

  const handleGraphChange = () => {
    setBarRadar(!barRadar);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Modal
      open={true}
      onClose={handleClose}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Box
        p={3}
        style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
      >
        <h1>{ingredientData.name}</h1>

        <Stack direction="row" spacing={16} justifyContent="center" alignItems="center">
        {/* Left column */}
        <Box>
            <p><strong>Energy:</strong> {ingredientData.energykcal} kcal</p>
            <p><strong>Protein:</strong> {ingredientData.proteing} g</p>
            <p><strong>Fat:</strong> {ingredientData.fatg} g</p>
            <p><strong>Carbs:</strong> {ingredientData.carbg} g</p>
            <p><strong>Fiber:</strong> {ingredientData.fiberg} g</p>
            <p><strong>Sugar:</strong> {ingredientData.sugarg} g</p>
        </Box>

        {/* Right column */}
        <Box>
            <p><strong>Vitamin C:</strong> {ingredientData.vitcmg} mg</p>
            <p><strong>Vitamin B6:</strong> {ingredientData.vitb6mg} mg</p>
            <p><strong>Vitamin B12:</strong> {ingredientData.vitb12mcg} mcg</p>
            <p><strong>Vitamin A:</strong> {ingredientData.vitamcg} mcg</p>
            <p><strong>Vitamin E:</strong> {ingredientData.vitemg} mg</p>
            <p><strong>Vitamin D2:</strong> {ingredientData.vitd2mcg} mcg</p>
        </Box>
        </Stack>

        <ButtonGroup style={{ marginBottom: 20 }}>
          <Button disabled={barRadar} onClick={handleGraphChange}>Bar</Button>
          <Button disabled={!barRadar} onClick={handleGraphChange}>Radar</Button>
        </ButtonGroup>

        { /* Display non-vitamin attributes as tabs above the radar chart */ }
        {!barRadar && nonVitaminData.length > 0 && (
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            {nonVitaminData.map((item, index) => (
              <Tab key={index} label={`${item.label}: ${item.value}`} />
            ))}
          </Tabs>
        )}

        <div style={{ margin: 20 }}>
          {barRadar ? (
            <ResponsiveContainer height={200}>
            <BarChart
              data={barData}
              layout='vertical'
              margin={{ right: 30, left: 6, bottom: 20 }}
            >
              <XAxis 
              type='number' 
              domain={[0, extendedMax]}
              label={{ value: 'g', position: 'insideRight', dx: 27 }} 
              tickCount={5} />
          
              <YAxis
                type='category'
                dataKey='label'
                tick={{ angle: 0, textAnchor: 'end' }}
                tickMargin={10}
              />
          
              <Bar dataKey='value' stroke='#8884d8' fill='#8884d8' />
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <ResponsiveContainer height={200}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar name="Fiber & Vitamins" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
}
