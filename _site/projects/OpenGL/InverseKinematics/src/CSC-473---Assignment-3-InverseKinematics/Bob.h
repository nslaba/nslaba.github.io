#pragma once

/*
			This is Bob.

*/


#include "BaseSystem.h"
#include <shared/defs.h>
#include <util/util.h>
#include "animTcl.h"
#include <GLmodel/GLmodel.h>
#include "Particle.h"
#include "shared/opengl.h"
#include <vector>
#include "rAngles.h"

class Bob : public BaseSystem
{
public:
	Bob(const std::string& name);
	// getters and setters


	// Parameter variables for Bob and his classroom
	float WallWidth = 24.0;
	float WallHeight = 12.0;
	float BoardWidth = 12.0;
	float BoardHeight = 8.0;
	float torsoWidth = WallHeight / 8.0;
	float torsoHeight = WallHeight / 4.0;
	float limbHeight = WallHeight / 8.0;
	float limbWidth = WallHeight / 30.0;
	float L1 = 2.0;
	float L2 = 2.0;
	float L3 = 0.5;
	float z = 2.7;

	//initial position angles
	rAngles angles = rAngles{ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 };
	rAngles leftAngles = rAngles{ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 };

	//TESTING VAR
	glm::vec3 temp_end_eff{ 0.0, 0.0, 0.0 };
	glm::vec3 target_point{ 0.0, 0.0, 0.0 };
	bool restPosition = true;
	bool readyPosition = false;

	// Nescessary functions
	void drawScene();
	void drawBob();
	void drawRightHand(rAngles angles);
	int command(int argc, myCONST_SPEC char** argv);
	void display(GLenum mode = GL_RENDER);
protected:

};
