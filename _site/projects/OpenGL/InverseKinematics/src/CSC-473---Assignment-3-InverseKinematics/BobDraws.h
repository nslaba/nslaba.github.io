#pragma once

#include "BetaSolver.h"
#include "EndEffectorWorldCoord.h"
#include <GLModel/GLModel.h>
#include <shared/defs.h>
#include <util/util.h>
#include "animTcl.h"
#include "BaseSimulator.h"
#include "BaseSystem.h"
#include "Bob.h"
#include "BaseSimulator.h"
#include <glm/glm.hpp>
#include <glm/geometric.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include "HermiteSpline.h"
#include <math.h>



class BobDraws :
	public BaseSimulator
{
public:
	BobDraws(const std::string& name, HermiteSpline* drawing, Bob* bob);
	~BobDraws();
	int step(double time);
	int command(int argc, myCONST_SPEC char** argv);
	int init(double time) { return 0; };
	void lerp(Eigen::Vector4d start, Eigen::Vector4d end, float scalar);
	void converge(int max);
	void updateAngles(Eigen::VectorXd newThetas);
	void updateTargetPoints();
	//FOR TESTING
	void print_vals_for_testing(Eigen::Vector4d step);

	// new functions & vars for spline traversal
	void updateP_target(float time);
	void moveToPointInOneFrame();

private:
	HermiteSpline* drawingPath;
	Bob* m_bob;
	
	void initializePs();
	double t = 0.01;
	bool startDrawingBob = true;
	/* VARIABLES FOR THE ENTIRE IKSIM*/
	
	// Storage for dtThetas
	Eigen::VectorXd dtThetas;
	// Control Point ID
	int cPointID = 0;
	// End effector in world coordinates AKA Pinitial (where the arm actually is)
	Eigen::VectorXd P_endEffector;
	// P target in world coordinates
	Eigen::VectorXd P_target;
	// Epsilon
	double Epsilon = 0.01;
	// The difference between P-target and P_endEffector
	Eigen::VectorXd Error;
	Eigen::VectorXd start;
	Eigen::VectorXd end;
	int lerp_iteration = 0;
	int point_lerp = 0;

	bool startOfSpline = false;

	double max_animation_time = 2.5;// max animation time is 2.5 seconds
	double max_lerp_time = 0.5; // max time it takes to get to start of spline from resting position
	Eigen::Vector4d resting_position; // save the initial resting position found by P_endEffector
	double dt = 0.0;
	double prevTime = 0.0;
	double lerp_time = 0.0;
};