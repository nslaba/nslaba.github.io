#include "EndEffectorWorldCoord.h"

void printMatrix(Eigen::MatrixXd mat)
{

	for (int i = 0; i < 4; i++) {
		animTcl::OutputMessage("%f %f %f %f\n", mat.row(i)[0], mat.row(i)[1], mat.row(i)[2], mat.row(i)[3]);
	}
	animTcl::OutputMessage("\n\n");
}
EndEffectorWorldCoord::EndEffectorWorldCoord(rAngles angles, double L1, double L2, double L3, double z): matrixTransform(4,4)
{
	matrixTransform =  translateZ(z) * xRoll(angles.theta1) * yRoll(angles.theta2) * zRoll(angles.theta3)
					* translateY(-L1) * xRoll(angles.theta4) * yRoll(angles.theta5)
					* translateY(-L2) * zRoll(angles.theta6) * yRoll(angles.theta7)
					* translateY(-L3);
	
	//printMatrix(matrixTransform);
}

Eigen::Matrix4d EndEffectorWorldCoord::translateZ(double translation)
{
	Eigen::Matrix4d translateZ;
	translateZ <<
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, translation,
		0.0, 0.0, 0.0, 1.0
		;

	return translateZ;
}

Eigen::Matrix4d EndEffectorWorldCoord::translateY(double translation)
{
	Eigen::Matrix4d translateY;
	translateY <<
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, translation,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
		;

	return translateY;
}

Eigen::Matrix4d EndEffectorWorldCoord::translateX(double translation)
{
	Eigen::Matrix4d translateX;
	translateX <<
		1.0, 0.0, 0.0, translation,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
		;

	return translateX;
}

Eigen::Matrix4d EndEffectorWorldCoord::xRoll(double theta)
{
	
	Eigen::Matrix4d xRoll;
	xRoll <<
		1.0, 0.0, 0.0, 0.0,
		0.0, cos(theta), -sin(theta), 0.0,
		0.0, sin(theta), cos(theta), 0.0,
		0.0, 0.0, 0.0, 1.0
		;
	
	return xRoll;
}
Eigen::Matrix4d EndEffectorWorldCoord::yRoll(double theta)
{

	
	Eigen::Matrix4d yRoll;
	yRoll <<
		cos(theta), 0.0, sin(theta), 0.0,
		0.0, 1.0, 0.0, 0.0,
		-sin(theta), 0.0, cos(theta), 0.0,
		0.0, 0.0, 0.0, 1.0
		;
	
	return yRoll;
}
Eigen::Matrix4d EndEffectorWorldCoord::zRoll(double theta)
{

	
	Eigen::Matrix4d zRoll;
	zRoll <<
		cos(theta), -sin(theta), 0.0, 0.0,
		sin(theta), cos(theta), 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
		;
	
	return zRoll;
}
Eigen::Matrix4d EndEffectorWorldCoord::dtxRoll(double theta)
{
	
	Eigen::Matrix4d dtxRoll;
	dtxRoll <<
		0.0, 0.0, 0.0, 0.0,
		0.0, -sin(theta), -cos(theta), 0.0,
		0.0, cos(theta), -sin(theta), 0.0,
		0.0, 0.0, 0.0, 0.0
		;

	return dtxRoll;
}
Eigen::Matrix4d EndEffectorWorldCoord::dtyRoll(double theta)
{
	
	Eigen::Matrix4d dtyRoll;
	dtyRoll <<
		-sin(theta), 0.0, cos(theta), 0.0,
		0.0, 0.0, 0.0, 0.0,
		-cos(theta), 0.0, -sin(theta), 0.0,
		0.0, 0.0, 0.0, 0.0
		;

	return dtyRoll;
}
Eigen::Matrix4d EndEffectorWorldCoord::dtzRoll(double theta)
{
	
	Eigen::Matrix4d dtzRoll;
	dtzRoll <<
		-sin(theta), -cos(theta), 0.0, 0.0,
		cos(theta), -sin(theta), 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0
		;
	return dtzRoll;
}

