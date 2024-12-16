# CIS 550 Project of GROUP 29 -- Recipe Finder
![](https://i.ibb.co/W5WM4v8/maskable-icon-removebg-preview.png)

## Contributors (alphabetically)
* [Amy Fang](https://github.com/AMYFYJ)
* [Jiayi Jiang](https://github.com/JiangJiayi32)
* [Houji Pan](https://github.com/houjipan)
* [Ziyu Pan](https://github.com/ziyupan26)

## Description
Our website is designed to revolutionize the way users explore, discover, and enjoy recipes. By offering a personalized experience, the platform enables users to search for recipes based on ingredients, and enjoy a wide array of additional features such as user registration, favorite recipe collections, and ratings-driven recommendations. 

## How to use our application
1. Download the folder /client and /server
2. 

## Application Structure
/data     
>Datasets_Preprocessing_EDA.ipynb: data cleaning and preprocessing, ingredients matching

/client          
>/public            
>>index.html        
>>maskable_icon-removebg-preview.ico            
>/src         
>>/components             
>>>IngredientCard.js           
>>>LazyTable.js          
>>>maskable_icon-removebg-preview.png           
>>>NavBar.js            
>>>RecipeCard.js         
>>/helpers        
>>>api.js        
>>>formatter.js        
>>>recipeimages.js            
>>>recipeingredient.js           
>>>recipeinstruction.js         
>>/pages        
>>>CalculatorPage.js           
>>>CategoryInfoPage.js         
>>>CategoryPage.js       
>>>HomePage.js   
>>>IngredientsPage.js    
>>>RecipePage.js     
>>>SearchResultsPage.js    
>.gitignore     
>package.json    
>package-lock.json   

/server     
>.gitignore       
  package.json    
  package-lock.json        
  routes.js   
  server.js    


