#pragma once

#include <eigen-3.4.0/Eigen/Dense>
#include "BaseSystem.h"
#include <shared/defs.h>
#include <util/util.h>
#include "animTcl.h"
#include <GLmodel/GLmodel.h>
#include "shared/opengl.h"
#include <glm/glm.hpp>
#include "rAngles.h"

class EndEffectorWorldCoord
{
public:
	// default constructor
	EndEffectorWorldCoord() = default;
	EndEffectorWorldCoord(rAngles angles, double L1, double L2, double L3, double z);

	Eigen::MatrixXd matrixTransform;

	// Translations
	Eigen::Matrix4d translateZ(double translation);
	Eigen::Matrix4d translateY(double translation);
	Eigen::Matrix4d translateX(double translation);

	// Rotations
	Eigen::Matrix4d xRoll(double theta);
	Eigen::Matrix4d yRoll(double theta);
	Eigen::Matrix4d zRoll(double theta);
	Eigen::Matrix4d dtxRoll(double theta);
	Eigen::Matrix4d dtyRoll(double theta);
	Eigen::Matrix4d dtzRoll(double theta);

	
	// Create a series of matrices to multiply together to get one correct transformation matrix

protected:

};