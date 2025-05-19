#include "HermiteSpline.h"
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <iostream>
#include <math.h>
#include <algorithm>

/* Implement inheritance from BaseSystem.cpp */
HermiteSpline::HermiteSpline(const std::string& name) :
	BaseSystem(name)

{

}
// HermiteSpline


float HermiteSpline::getFullLength()
{
	return getArcLength(1);
}


/* ****************************************************************************************************************************************************
 * 
 * FUNCTION =   getU
 *
 * Parameters:  S, LookUpTableEntry-> contains the arclength I need to find U
 * Output:      U, a parameter in the lookUpTable
 *
 * Purpose:     Loop through the table and find the closest arclength based on s. Then find the corresponding u value
 ******************************************************************************************************************************************************/
float HermiteSpline::getU(LookUpTableEntry s)
{
	float u;
	// Use binary search to make looping faster
	auto lower_bound = std::lower_bound(lookUpTable.begin(), lookUpTable.end(), s, [](LookUpTableEntry a, LookUpTableEntry b) {return a.arcLength < b.arcLength; });
	int index = std::distance(lookUpTable.begin(), lower_bound);
	
	if (s.arcLength < lookUpTable[index].arcLength) { // LERP between the two u indeces--> but the relationship between s and u isn't linear so how can you?
		u = lookUpTable[index].u - ((s.arcLength/lookUpTable[index].arcLength)*(lookUpTable[index].u-lookUpTable[index-1].u));
	}
	else {
		u = lookUpTable[index].u;
	}

	return u;
}

/* ****************************************************************************************************************************************************
 * 
 * FUNCTION =   GetPointAtU
 *
 * Parameters:  U, a parameter within the lookUpTable
 * Output:      ControlPoint related to U
 *
 * Purpose:     Generate the correct point based on a given parameter u
 ******************************************************************************************************************************************************/
ControlPoint HermiteSpline::getPointAtU(float u)
{
	// Innitialize the position
	ControlPoint point = ControlPoint();
	/* STEP 1 Find the right index*/

	//find deltaU
	float totalSamples = numKnots-1;
	float deltaU = 1.0 / totalSamples;
	int indexFirst = (int)(u / deltaU);

	// mod u by deltaU and get the correct remainder
	float remainder = (u - (deltaU * indexFirst))/deltaU;

	// use getNext to find the right ControlPoint
	point = getNext(controlPoints[indexFirst], controlPoints[indexFirst + 1], remainder);
	return point; 
}




int HermiteSpline::command(int argc, myCONST_SPEC char** argv)
{
	if (argc < 1)
	{
		animTcl::OutputMessage("system %s: wrong number of params.", m_name.c_str());
		return TCL_ERROR;
	}
	
	glutPostRedisplay();
	return TCL_OK;

}	// HermiteSpline::command


/* ****************************************************************************************************************************************************
 * 
 * HELPER FUNCTION =   getArcLength
 *
 * Parameters:  t, a parameter between 0 and 1
 * Output:      the correct arcLength
 *
 * Purpose:     translates t to the correct index and finds arclength in the lookUp table
 ******************************************************************************************************************************************************/
float HermiteSpline::getArcLength(float t)
{	
	float totalSamples = lookUpTable.size()-1;
	float deltaU = 1.0 / totalSamples;
	int id = (int)(t / deltaU);	
	float arcLength = lookUpTable[id].arcLength;
	return arcLength;
}

void HermiteSpline::makeCatmulRom()
{
	//Loop to the first available Control Point
	int i = 0;
	// Deal with the first knot's tangent

	controlPoints[i].tangent = (float)(2.0) * (controlPoints[i + 1].point - controlPoints[i].point) - (float)(0.5) * (controlPoints[i + 2].point - controlPoints[i].point);
	// Deal with the intermediate
	i++;
	for (i; i < numKnots - 1; i++)
	{
		controlPoints[i].tangent = (float)(0.5) * (controlPoints[i + 1].point - controlPoints[i - 1].point);

	}
	// Deal with the last
	controlPoints[i].tangent = (float)(2.0) * (controlPoints[i].point - controlPoints[i - 1].point) - (float)(0.5) * (controlPoints[i].point - controlPoints[i - 2].point);
}

void HermiteSpline::load(std::string filename)
{
	std::fstream f;
	f.open(filename);
	
	std::string fileLine;

	// Get the first line of the file that does not relate to the control points
	std::getline(f, fileLine);
	
	// Initialize a ControlPoint before the loop
	ControlPoint controlPoint;

	// Keep track of an index for controlPoint storrage
	int index = 0;

	while (1)
	{
		
		// Read the file line by line
		std::getline(f, fileLine);

		if (f.eof()) break;
	
		/* Parse on a space and save the Px, Py, Pz, Sx, Sy, Sz */
		// Point:
		char* next = NULL;
		char* pX = strtok_s(const_cast<char*>(fileLine.c_str()), " ", &next);
		std::string fpx(pX);
		controlPoint.point.x = std::stof(fpx)/2.5;

		
		char* pY = strtok_s(NULL, " ", &next);
		std::string fpy(pY);
		controlPoint.point.y = (std::stof(fpy)-3.0)/3.0;
	

		controlPoint.point.z = 0.1;
		
		controlPoint.tangent.x = 0.0;
		controlPoint.tangent.y = 0.0;
		controlPoint.tangent.z = 0.0;
		
		controlPoint.empty = false;

		// Add the controlPoint to controlPoints array keeping track of the appropriate index
		controlPoints[index] = controlPoint;
		numKnots++;
		
		index++;
	}
	
	// Close the file
	f.close();
	makeCatmulRom();
	updateLookUpTable();
	
}

/* ****************************************************************************************************************************************************
 * 
 * HELPER FUNCTION =   getNext
 *
 * Parameters:  ControlPoint start, ControlPoint end, double t
 * Output:      ControlPoint -> the correctly generated control point t distance from start towards end
 *
 * Purpose:     Using the hermite spline formula, find the position, tangent and second tangent of a point some distance from start toward end
 ******************************************************************************************************************************************************/
ControlPoint HermiteSpline::getNext(ControlPoint start, ControlPoint end, double t)
{
	ControlPoint nextPoint;
	// Update the point
	nextPoint.point = float(2 * pow(t, 3) - 3 * pow(t,2) + 1) * start.point 
		+ float(-2 * pow(t,3) + 3 * pow(t, 2)) * end.point
		+ float(pow(t,3) - 2 * pow(t,2) + t) * start.tangent 
		+ float(pow(t, 3) - pow(t, 2)) * end.tangent;

	// Update the tangent
	nextPoint.tangent = float(6 * pow(t, 2) - 6 * t) * start.point
		+ float(-6 * pow(t, 2) + 6 * t) * end.point
		+ float(3 * (pow(t, 2)) - 4 * t + 1) * start.tangent
		+ float(3 * (pow(t, 2)) - 2 * t) * end.tangent;


	// Update the second tangent
	nextPoint.secondTangent = float(12 * t - 6) * start.point
		+ float(-12 * t + 6) * end.point
		+ float(6 * t - 4) * start.tangent
		+ float(6 * t - 2) * end.tangent;

	return nextPoint;
} // HermiteSpline::getNext


/* ****************************************************************************************************************************************************
 * 
 * FUNCTION =   updateLookUpTable
 *
 * Parameters:  void
 * Output:      void
 *
 * Purpose:     Updates the lookUpTable based on the current number of knots given by user
 ******************************************************************************************************************************************************/
void HermiteSpline::updateLookUpTable()
{

	lookUpTable.clear();
	float totalSamples = ((numKnots - 1) * 1000 + numKnots);
	float deltaU = 1.0 / totalSamples;
	float u = 0;
	double arcLength = 0;
	
	// Variables for arclength
	ControlPoint next;
	ControlPoint prev;
	LookUpTableEntry entry = LookUpTableEntry();
	
	// Trivial entry
	entry.u = u;
	entry.arcLength = arcLength;
	lookUpTable.push_back(entry);

	
	for (int i=0; i < numKnots-1; i++) {
		prev = controlPoints[i];		
		
		for (double t = 0; t < 1; t += 0.001)
		{
			// Get the new point based on controlPoints[i], controlPoints[i+1] and t. 
			next = getNext(controlPoints[i], controlPoints[i + 1], t);
			arcLength += glm::length(next.point - prev.point);
			
			//Update lookup table
			u += deltaU;
			entry.u = u;
			entry.arcLength = arcLength;
			lookUpTable.push_back(entry);
					
			//update variables
			prev = next;
			
		}

	}
	//Add the last entry to the table
	u +=deltaU;
	entry.u = u;
	entry.arcLength += glm::length(controlPoints[numKnots-1].point - prev.point);

	lookUpTable.push_back(entry);

}

/* Now that I have extracted the controlPoints from the CMD, it is time to draw a HermiteSpline*/

void HermiteSpline::display(GLenum mode)
{
	glEnable(GL_LIGHTING);
	glMatrixMode(GL_MODELVIEW);
	glPushMatrix();
	glPushAttrib(GL_ALL_ATTRIB_BITS);
	
	
	glLineWidth(0.5);
	glBegin(GL_LINE_STRIP);
	glColor3f(1, 1, 1);

	for (int i = 0; i < numKnots-1; i++) {
		glVertex3f(controlPoints[i].point.x, controlPoints[i].point.y, 0.1);
		// Generate a hundred extra points between the current and the next in order to make the Hermite HermiteSpline smooth.
		for (double t = 0; t < 1; t += 0.001) 
		{
			// Get the new point based on controlPoints[i], controlPoints[i+1] and t. 
			ControlPoint nextPoint = getNext(controlPoints[i], controlPoints[i + 1], t);			
			
			// Draw the point
			glVertex3f(nextPoint.point.x, nextPoint.point.y, 0.1);
		}
	}
	glVertex3f(controlPoints[numKnots - 1].point.x, controlPoints[numKnots - 1].point.y, 0.1);
	
	glEnd();
	
	//glColor3f(1, 1, 1);


	glPopMatrix();
	glPopAttrib();

}	// HermiteSpline::display