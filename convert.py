import csv
import json

def format(row):
    fips = row['State FIPS'] + row['County FIPS']
    income = row['Median Household Income']
    
    if fips == '00000': # Overall US Code, ignore
        return None, None, None
    if len(fips) == 0:  # Bad value
        return None, None, None
    if not fips.isdigit(): # Header text
        return None, None, None
    if len(income) == 0: # Bad income value
        return None, None, None
        
    income = int(income.replace(',', ''))  
    name = row['Name'] + ", " + row['Postal'] 
    return fips, income, name
    
def find_num_greater(county, all):
    """This finds the number of counties with a median income greater than the current county"""
    county_income = all[county]['income']
    num_greater = 0
    for cur in all:
        if(cur == county):
            continue
        if(all[cur]['income'] > county_income):
            num_greater += 1
    return num_greater            

f = open( 'income.csv', 'rU' )
reader = csv.DictReader( f, fieldnames = ( "State FIPS","County FIPS","Postal","Name", "Median Household Income" ) )

result = {}
for row in reader:
    fips, income, name = format(row)
    if fips:
        result[fips] = {'income': income, 'name': name}
        
for county in result:
    result[county]['numgreater'] = find_num_greater(county, result)

out = json.dumps(result)
#print out
print len(result)