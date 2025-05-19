#include "Jacobian.h"
void printMatrixJac(Eigen::MatrixXd mat)
{
	animTcl::OutputMessage("\nJacobian by row: ");
	for (int i = 0; i < 3; i++) {
		animTcl::OutputMessage("%f %f %f %f %f %f %f\n", mat.row(i)[0], mat.row(i)[1], mat.row(i)[2], mat.row(i)[3], mat.row(i)[4], mat.row(i)[5], mat.row(i)[6]);
	}
	animTcl::OutputMessage("\n\n");
	animTcl::OutputMessage("\nJacobian by column: ");
	for (int i = 0; i < 7; i++) {
		animTcl::OutputMessage("%f %f %f\n", mat.col(i)[0], mat.col(i)[1], mat.col(i)[2]);
	}
	animTcl::OutputMessage("\n\n");
}
Jacobian::Jacobian(rAngles angles, float L1, float L2, float L3, float z): jacobian(3, 7)
{
	// initialize point in wrist coordinates
	point_wrist_coord << 0.0, -L3, 0.0, 1.0;
	// Initialize jacobian to zero
	jacobian.row(0) << 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0;
	jacobian.row(1) << 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0;
	jacobian.row(2) << 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0;
	// set the correct columns of the jacobian
	setColumn1(angles, L1, L2, z, point_wrist_coord);
	setColumn2(angles, L1, L2, z, point_wrist_coord);
	setColumn3(angles, L1, L2, z, point_wrist_coord);
	setColumn4(angles, L1, L2, z, point_wrist_coord);
	setColumn5(angles, L1, L2, z, point_wrist_coord);
	setColumn6(angles, L1, L2, z, point_wrist_coord);
	setColumn7(angles, L1, L2, z, point_wrist_coord);
	//printMatrixJac(jacobian);
}



void Jacobian::setColumn1(rAngles angles, float L1, float L2, float trRoot, Eigen::Vector4f point)
{
	point = translateZ(trRoot)  * zRoll(angles.theta3) * yRoll(angles.theta2) * dtxRoll(angles.theta1) 
		* toElbow(-L1) * yRoll(angles.theta5) * xRoll(angles.theta4)
		* toWrist(-L2) *  yRoll(angles.theta7) * zRoll(angles.theta6) *  point;


	jacobian.col(0) << point[0], point[1], point[2];
}
void Jacobian::setColumn2(rAngles angles, float L1, float L2, float trRoot, Eigen::Vector4f point)
{
	
	point = translateZ(trRoot) * zRoll(angles.theta3) * dtyRoll(angles.theta2) * xRoll(angles.theta1)
		* toElbow(-L1) * yRoll(angles.theta5) * xRoll(angles.theta4)
		* toWrist(-L2) * yRoll(angles.theta7) * zRoll(angles.theta6) * point;

	jacobian.col(1) << point[0], point[1], point[2];
}
void Jacobian::setColumn3(rAngles angles, float L1, float L2, float trRoot, Eigen::Vector4f point)
{	
	point = translateZ(trRoot) * dtzRoll(angles.theta3) * yRoll(angles.theta2) * xRoll(angles.theta1)
		* toElbow(-L1) * yRoll(angles.theta5) * xRoll(angles.theta4)
		* toWrist(-L2) * yRoll(angles.theta7) * zRoll(angles.theta6) * point;
	
	jacobian.col(2) << point[0], point[1], point[2];
}
void Jacobian::setColumn4(rAngles angles, float L1, float L2, float trRoot, Eigen::Vector4f point)
{
	point = translateZ(trRoot) * zRoll(angles.theta3) * yRoll(angles.theta2) * xRoll(angles.theta1)
		* toElbow(-L1) * yRoll(angles.theta5) * dtxRoll(angles.theta4)
		* toWrist(-L2) * yRoll(angles.theta7) * zRoll(angles.theta6) * point;
	
	jacobian.col(3) << point[0], point[1], point[2];
}
void Jacobian::setColumn5(rAngles angles, float L1, float L2, float trRoot, Eigen::Vector4f point)
{
	
	point = translateZ(trRoot) * zRoll(angles.theta3) * yRoll(angles.theta2) * xRoll(angles.theta1)
		* toElbow(-L1) * dtyRoll(angles.theta5) * xRoll(angles.theta4)
		* toWrist(-L2) * yRoll(angles.theta7) * zRoll(angles.theta6) * point;
	
	jacobian.col(4) << point[0], point[1], point[2];
}
void Jacobian::setColumn6(rAngles angles, float L1, float L2, float trRoot, Eigen::Vector4f point)
{

	point = translateZ(trRoot) * zRoll(angles.theta3) * yRoll(angles.theta2) * xRoll(angles.theta1)
		* toElbow(-L1) * yRoll(angles.theta5) * xRoll(angles.theta4)
		* toWrist(-L2) * yRoll(angles.theta7) * dtzRoll(angles.theta6) * point;
	
	jacobian.col(5) << point[0], point[1], point[2];
}
void Jacobian::setColumn7(rAngles angles, float L1, float L2, float trRoot, Eigen::Vector4f point)
{

	point = translateZ(trRoot) * zRoll(angles.theta3) * yRoll(angles.theta2) * xRoll(angles.theta1)
		* toElbow(-L1) * yRoll(angles.theta5) * xRoll(angles.theta4)
		* toWrist(-L2) * dtyRoll(angles.theta7) * zRoll(angles.theta6) * point;

	// Set the Jacobian column
	jacobian.col(6) << point[0], point[1], point[2];
}

Eigen::Matrix4f Jacobian::translateZ(float translation)
{
	Eigen::Matrix4f translateZ;
	translateZ <<
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, translation,
		0.0, 0.0, 0.0, 1.0
		;

	return translateZ;
}

Eigen::Matrix4f Jacobian::toShoulder(float translation)
{
	Eigen::Matrix4f toShoulder;
	toShoulder<<
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, translation,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	;
	
	return toShoulder;
}

Eigen::Matrix4f Jacobian::toElbow(float translation)
{
	Eigen::Matrix4f toElbow;
	toElbow <<
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, translation,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	;
	
	return toElbow;
}

Eigen::Matrix4f Jacobian::toWrist(float translation)
{
	Eigen::Matrix4f toWrist;
	toWrist <<
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, translation,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	;
	
	return toWrist;
}

Eigen::Matrix4f Jacobian::xRoll(float theta)
{
	

	Eigen::Matrix4f xRoll;
	xRoll <<
		1.0, 0.0, 0.0, 0.0,
		0.0, cos(theta), -sin(theta), 0,
		0.0, sin(theta), cos(theta), 0.0,
		0.0, 0.0, 0.0, 1.0
	;
	
	return xRoll;
}
Eigen::Matrix4f Jacobian::yRoll(float theta)
{

	

	Eigen::Matrix4f yRoll;
	yRoll <<
		cos(theta), 0.0, sin(theta), 0.0,
		0.0, 1.0, 0.0, 0.0,
		-sin(theta), 0.0, cos(theta), 0.0,
		0.0, 0.0, 0.0, 1.0
	;

	return yRoll;
}
Eigen::Matrix4f Jacobian::zRoll(float theta)
{


	Eigen::Matrix4f zRoll;
	zRoll <<
		cos(theta), -sin(theta), 0.0, 0.0,
		sin(theta), cos(theta), 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	;

	return zRoll;
}
Eigen::Matrix4f Jacobian::dtxRoll(float theta)
{
	
	Eigen::Matrix4f dtxRoll;
	
	dtxRoll <<
		0.0, 0.0, 0.0, 0.0,
		0.0, -sin(theta), -cos(theta), 0.0,
		0.0, cos(theta), -sin(theta), 0.0,
		0.0, 0.0, 0.0, 0.0
	;

	return dtxRoll;
}
Eigen::Matrix4f Jacobian::dtyRoll(float theta)
{
	

	Eigen::Matrix4f dtyRoll;
	dtyRoll <<
		-sin(theta), 0.0, cos(theta), 0.0,
		0.0, 0.0, 0.0, 0.0,
		-cos(theta), 0.0, -sin(theta), 0.0,
		0.0, 0.0, 0.0, 0.0
	;

	return dtyRoll;
}
Eigen::Matrix4f Jacobian::dtzRoll(float theta)
{
	

	Eigen::Matrix4f dtzRoll;
	dtzRoll <<
		-sin(theta), -cos(theta), 0.0, 0.0,
		cos(theta), -sin(theta), 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0
		;
	return dtzRoll;
}
