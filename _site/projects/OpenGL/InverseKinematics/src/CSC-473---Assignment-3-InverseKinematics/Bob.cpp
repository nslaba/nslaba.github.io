#include "Bob.h"

#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <iostream>
#include <math.h>
#include <algorithm>

Bob::Bob(const std::string& name) :
	BaseSystem(name)
{

}


// Nescessary functions

void Bob::drawScene() {
	glPushAttrib(GL_ALL_ATTRIB_BITS);
	glPushMatrix();

	// tranlate
	//glRotated(45.0, 0.0, 1.0, 0.0);
	/*glRotated(5.0, 0.0, 0.0, 1.0);*/ // Change this to perspective projection later instead

	// Floor
	glPushMatrix();
	glTranslated(0, -(WallHeight / 2.0), BoardHeight / 2.0);
	glRotated(90.0, 1.0, 0.0, 0.0);
	glScaled(WallWidth, BoardHeight, 0.1);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(1.0, 1.0, 0.0);
	glutSolidCube(1);
	glPopMatrix();

	// Blackboard
	glPushMatrix();
	glScaled(BoardWidth, BoardHeight, 0.02);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0, 0.0, 0.0);
	glutSolidCube(1);
	glPopMatrix();

	// Wall
	glScaled(WallWidth, WallHeight, 0.01);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(1.0, 1.0, 1.0);
	glutSolidCube(1);


	glPopMatrix();
	glPopAttrib();
}

void Bob::drawBob() {

	
	/* STEP 1: Draw character, Bob */
	
	glPushMatrix(); 

	// Translate the whole person away from the board by z and down by half of torsoHeight
	glTranslated(-torsoWidth/2.0, -torsoHeight / 2.0, z);
	

	// Draw Torso			
	glPushMatrix(); 
	glScaled(torsoWidth, torsoHeight, 1);
	//animTcl::OutputMessage("torsoHeight is: %f", torsoHeight);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0.0, 1.0, 0.0);
	GLdrawCircle(0.5, 500);
	glPopMatrix();

	// HEAD
	glPushMatrix();
	glTranslated(0, torsoHeight / 2.0 + WallHeight / 20.0, 0);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0.0, 1.0, 0.0);
	GLdrawCircle(WallHeight / 20.0, 500);
	glPopMatrix();

	// ARM LEFT
	

	glPushMatrix();
	glTranslated(-(torsoWidth) / 2.0, torsoHeight / 2.0, 0.0);
	if (restPosition) glRotated(-90, 0, 0, 1);
	// ARMS
	// right arm
	glPushMatrix();

	// 3 DOF for Shoulder
	glRotated(leftAngles.theta1, 1.0, 0.0, 0.0);
	glRotated(leftAngles.theta2, 0.0, 1.0, 0.0);
	glRotated(leftAngles.theta3, 0.0, 0.0, 1.0);


	//right forearm
	glPushMatrix();
	glTranslated(0, -L1, 0);
	glRotated(leftAngles.theta4, 1.0, 0.0, 0.0);
	glRotated(leftAngles.theta5, 0.0, 1.0, 0.0);


	// right hand
	glPushMatrix();
	glTranslated(0, -L2, 0);
	glRotated(leftAngles.theta6, 0.0, 0.0, 1.0);
	glRotated(leftAngles.theta7, 0.0, 1.0, 0.0);


	//draw hand
	glTranslated(0, -L3 / 2.0, 0);
	glScaled(limbWidth, L3, 1);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0.0, 1.0, 0.0);
	GLdrawCircle(0.5, 500);
	glPopMatrix();

	//draw forearm
	glTranslated(0, -L2 / 2.0, 0);
	glScaled(limbWidth, L2, 1);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0.0, 1.0, 0.0);
	GLdrawCircle(0.5, 500);
	glPopMatrix();

	//draw arm
	glTranslated(0, -L1 / 2.0, 0);
	glScaled(limbWidth, L1, 1);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0.0, 1.0, 0.0);
	GLdrawCircle(0.5, 500);
	glPopMatrix();

	glPopMatrix();


	// LEGS
	// right upper
	/*float limbHeight = WallHeight / 8.0;
	float limbWidth = WallHeight / 30.0;*/
	glPushMatrix();
	glTranslated(torsoWidth / 2.0, -(torsoHeight + limbHeight) / 2.0, 0);
	// right upper
	glPushMatrix();
	glTranslated(0, -limbHeight, 0);
	glScaled(limbWidth, limbHeight, 1);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0.0, 1.0, 0.0);
	GLdrawCircle(0.5, 500);
	glPopMatrix();
	// right lower
	glScaled(limbWidth, limbHeight, 1);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0.0, 1.0, 0.0);
	GLdrawCircle(0.5, 500);
	glPopMatrix();

	glPushMatrix();
	glTranslated(-torsoWidth / 2.0, -(torsoHeight + limbHeight) / 2.0, 0);
	// right upper
	glPushMatrix();
	glTranslated(0, -limbHeight, 0);
	glScaled(limbWidth, limbHeight, 1);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0.0, 1.0, 0.0);
	GLdrawCircle(0.5, 500);
	glPopMatrix();
	 //right lower
	glScaled(limbWidth, limbHeight, 1);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0.0, 1.0, 0.0);
	GLdrawCircle(0.5, 500);
	glPopMatrix();
	
	glPopMatrix();

	
	//glPopAttrib();
}

void Bob::drawRightHand(rAngles angles)
{
	// NOTE : only turn thetas into degrees when drawing
	
	glPushMatrix();
	glTranslated(0.0, 0.0, z);
	if (restPosition) glRotated(90, 0, 0, 1);
	// ARMS
	// right arm
	glPushMatrix();
	
	// 3 DOF for Shoulder
	glRotated(angles.theta1 * 180.0 / 3.141592653589, 1.0, 0.0, 0.0);
	glRotated(angles.theta2 * 180.0 / 3.141592653589, 0.0, 1.0, 0.0);
	glRotated(angles.theta3 * 180.0 / 3.141592653589, 0.0, 0.0, 1.0);
	
	
	//right forearm
	glPushMatrix();
	glTranslated(0, -L1, 0);
	glRotated(angles.theta4 * 180.0 / 3.141592653589, 1.0, 0.0, 0.0);
	glRotated(angles.theta5 * 180.0 / 3.141592653589, 0.0, 1.0, 0.0);
	

	// right hand
	glPushMatrix();	
	glTranslated(0, -L2, 0);
	glRotated(angles.theta6 * 180.0 / 3.141592653589, 0.0, 0.0, 1.0);
	glRotated(angles.theta7 * 180.0 / 3.141592653589, 0.0, 1.0, 0.0);


	//draw hand
	glTranslated(0, -L3/2.0, 0);
	glScaled(limbWidth, L3, 1);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0.0, 1.0, 0.0);
	GLdrawCircle(0.5, 500);
	glPopMatrix();

	//draw forearm
	glTranslated(0, -L2/2.0, 0);
	glScaled(limbWidth, L2, 1);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0.0, 1.0, 0.0);
	GLdrawCircle(0.5, 500);
	glPopMatrix();

	//draw arm
	glTranslated(0, -L1/2.0, 0);
	glScaled(limbWidth, L1, 1);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0.0, 1.0, 0.0);
	GLdrawCircle(0.5, 500);
	glPopMatrix();

	glPopMatrix();
}

int Bob::command(int argc, myCONST_SPEC char** argv)
{
	if (argc < 1)
	{
		animTcl::OutputMessage("system %s: wrong number of params.", m_name.c_str());
		return TCL_ERROR;
	}
	else if (strcmp(argv[0], "position") == 0) {
		if (argc == 4) {
			target_point.x = std::stof(argv[1]);
			target_point.y = std::stof(argv[2]);
			target_point.z = std::stof(argv[3]);

			animTcl::OutputMessage("position is: %f, %f, %f", target_point.x, target_point.y, target_point.z);

		}
		else {
			animTcl::OutputMessage("system %s: wrong number of params.", m_name.c_str());
			return TCL_ERROR;
		}
	}
	

	glutPostRedisplay();
	return TCL_OK;

}	// Bob::command


// System draws the particles
void Bob::display(GLenum mode)
{
	glEnable(GL_LIGHTING);
	glMatrixMode(GL_MODELVIEW);
	/* FOR TESTING DRAW GL GUIDELINE*/
	glPushMatrix();
	glTranslated(0, 0, 0);
		glScaled(0.1, 0.1, 0.1);
		glEnable(GL_COLOR_MATERIAL);
		glColor3f(1.0, 0.0, 0.0);
		glutSolidCube(1);
	glPopMatrix();
	//End effector
	glPushMatrix();
		
		glTranslated(0, 0, z);
		glRotated(20, 0, 0, 1);
		glTranslated(0, -L1, 0);
		glRotated(20, 1, 0, 0);
		glTranslated(0, -(L2 + L3), 0);
		glScaled(0.1, 0.1, 0.1);
		glEnable(GL_COLOR_MATERIAL);
		glColor3f(1.0, 0.0, 0.0);
		glutSolidCube(1);
		glPopMatrix();
	// End effector at beginning
	glPushMatrix();
	glTranslated(temp_end_eff.x, temp_end_eff.y, temp_end_eff.z);
	glScaled(0.1, 0.1, 0.1);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(0.0, 1.0, 0.0);
	glutSolidCube(1);
	glPopMatrix();

	// target point
	glPushMatrix();
	glTranslated(target_point.x, target_point.y, target_point.z);
	glScaled(0.1, 0.1, 0.1);
	glEnable(GL_COLOR_MATERIAL);
	glColor3f(1.0, 1.0, 1.0);
	glutSolidCube(1);
	glPopMatrix();

	

	/********************************/
	
	
	//Draw Scene
	drawRightHand(angles);
	drawBob();
	
	drawScene();
	
	
}