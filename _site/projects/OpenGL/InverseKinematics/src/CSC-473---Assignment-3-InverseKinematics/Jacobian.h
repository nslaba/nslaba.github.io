#pragma once

//#include "Transformations.h"
#include <eigen-3.4.0/Eigen/Dense>
#include "BaseSystem.h"
#include <shared/defs.h>
#include <util/util.h>
#include "animTcl.h"
#include <GLmodel/GLmodel.h>
#include "shared/opengl.h"
#include <vector>
#include <glm/glm.hpp>
#include "rAngles.h"


class Jacobian 
{
public:
	// default constructor
	Jacobian() = default;
	Jacobian(rAngles angles, float L1, float L2, float L3, float z);

	Eigen::MatrixXd jacobian;
	// getters and setters
	
	void setColumn1(rAngles angles, float trShoulder, float trElbow, float trRoot, Eigen::Vector4f point);
	void setColumn2(rAngles angles, float trShoulder, float trElbow, float trRoot, Eigen::Vector4f point);
	void setColumn3(rAngles angles, float trShoulder, float trElbow, float trRoot, Eigen::Vector4f point);
	void setColumn4(rAngles angles, float trShoulder, float trElbow, float trRoot, Eigen::Vector4f point);
	void setColumn5(rAngles angles, float trShoulder, float trElbow, float trRoot, Eigen::Vector4f point);
	void setColumn6(rAngles angles, float trShoulder, float trElbow, float trRoot, Eigen::Vector4f point);
	void setColumn7(rAngles angles, float trShoulder, float trElbow, float trRoot, Eigen::Vector4f point);


	// Translations
	Eigen::Matrix4f translateZ(float translation);
	Eigen::Matrix4f toShoulder(float translation);
	Eigen::Matrix4f toElbow(float translation);
	Eigen::Matrix4f toWrist(float translation);

	// Rotations
	Eigen::Matrix4f xRoll(float theta);
	Eigen::Matrix4f yRoll(float theta);
	Eigen::Matrix4f zRoll(float theta);
	Eigen::Matrix4f dtxRoll(float theta);
	Eigen::Matrix4f dtyRoll(float theta);
	Eigen::Matrix4f dtzRoll(float theta);
protected:
	
	Eigen::Vector4f point_wrist_coord;
	
};

