#include "BobDraws.h"

BobDraws::BobDraws(const std::string& name, HermiteSpline* drawing, Bob* bob) :
	BaseSimulator(name),
	drawingPath(drawing),
	m_bob(bob), P_endEffector(4), P_target(4), dtThetas(7), Error(4), start(4), end(4)
{											 
}	// BobDraws								  

BobDraws::~BobDraws()						  
{											  
}	// BobDraws::~BobDraws

int BobDraws::step(double time)
{
	// TESTING VAR
	m_bob->target_point = glm::vec3{ P_target[0], P_target[1], P_target[2] };

	//METHOD BY SEPERATION ANIMATION AND CALCULATIONS
	
	dt += (time - prevTime);
	
	if (dt >= -0.000001 && dt <= (max_lerp_time + 0.00001))
	{ // LERP to start of spline
		lerp(start, end, dt / max_lerp_time);
		converge(10);
		lerp_time = dt;
	}
	else if (dt > (max_lerp_time + 0.00001) && dt <= (max_animation_time + max_lerp_time))
	{ // move to the right spot on spline in one frame based on the fraction of max_anim_time
		updateP_target(dt - (lerp_time));
		moveToPointInOneFrame();
	}
	else if (dt > (max_animation_time + max_lerp_time))
	{ // move to the start of spline and reset dt
		initializePs();
		dt = 0.0;
	}
	else if (dt < -0.00001) {
		// simulation time has been reset
		dt = prevTime;
	}
	
	
	prevTime = time;
	

	return 0;
}


void BobDraws::converge(int max)
{
	Eigen::Vector4d step;
	
	/***************************************************************/
	/* STEP 2: update nescessary variables*/

	// 2) a. update P_EndEffector
	EndEffectorWorldCoord transform(m_bob->angles, m_bob->L1, m_bob->L2, m_bob->L3, m_bob->z);
	P_endEffector = transform.matrixTransform * Eigen::Vector4d{ 0.0, 0.0, 0.0, 1 };

	// 2) b. update error based on where bob's hand actually ended up
	Error = P_target - P_endEffector; // vec4

	/***************************************************************/
	/* STEP 3: converge to P_target*/
	int max_iterations = 0;

	while (Error.norm() > Epsilon && max_iterations < max)
	{
		// 3) a. Make a step along the error towards the actual target
		step = Error * 0.2f;

		// 3) b. Compute Jacobian based on current angles
		Jacobian j(m_bob->angles, m_bob->L1, m_bob->L2, m_bob->L3, m_bob->z);

		// 3) b. Find BETA based on step
		BetaSolver beta(j, Eigen::Vector3d{ step[0], step[1], step[2] });

		// 3) c. calculate dt Thetas based on Jt * beta
		dtThetas << j.jacobian.transpose() * beta.beta;


		// 3) d. update joint angles
		updateAngles(dtThetas);

		// 3) e. Recalculate actual end effector after the angles have been updated with the new jacobian. 
		EndEffectorWorldCoord transform(m_bob->angles, m_bob->L1, m_bob->L2, m_bob->L3, m_bob->z);
		P_endEffector << transform.matrixTransform * Eigen::Vector4d{ 0.0, 0.0, 0.0, 1 };

		// 3) f. Recalculate error
		Error << P_target - P_endEffector;

		// 3) g. update max iterations to avoid inf loops
		max_iterations++;

	}

}

/* The following function is given two points in space and a scalar. 
   It's purpose is to move the arm between those points in space by a certain scalar*/
void BobDraws::lerp(Eigen::Vector4d start, Eigen::Vector4d end, float scalar)
{
	Eigen::Vector4d step;
	/***************************************************************/
	/* STEP 1: find p target by linearly interpolating between start and end by scalar*/
	P_target = (1.0f - scalar) * start + end * scalar; 
	

	/***************************************************************/
	/* STEP 2: Update the nescessary variables */

	// 2) a. find the step that would get me to P_target
	step = P_target - P_endEffector; // gives vec4


	/***************************************************************/
	/* STEP 3: Make an actual step */

	// 3) a. Compute Jacobian based on current angles
	Jacobian j(m_bob->angles, m_bob->L1, m_bob->L2, m_bob->L3, m_bob->z);

	// 3) b. Find BETA based on step
	BetaSolver beta(j, Eigen::Vector3d{ step[0], step[1], step[2] });

	// 3) c. calculate dt Thetas based on Jt * beta
	dtThetas = j.jacobian.transpose() * beta.beta;

	// 3) d. update joint angles
	updateAngles(dtThetas);

	/****************************************************************/
	/* STEP 4: update nescessary variables*/

	// 4) a. update P_EndEffector
	EndEffectorWorldCoord transform(m_bob->angles, m_bob->L1, m_bob->L2, m_bob->L3, m_bob->z);
	P_endEffector = transform.matrixTransform * Eigen::Vector4d{ 0.0, 0.0, 0.0, 1 };

}

// Given a certain point update end effector to move there
void BobDraws::moveToPointInOneFrame() { 

	/* STEP 1: update P_endEffector*/
	EndEffectorWorldCoord transform(m_bob->angles, m_bob->L1, m_bob->L2, m_bob->L3, m_bob->z);
	P_endEffector = transform.matrixTransform * Eigen::Vector4d{ 0.0, 0.0, 0.0, 1 };
	
	/* STEP2: update step*/
	Eigen::Vector4d step;
	step = P_target - P_endEffector; // gives vec4

	/***************************************************************/

	/* STEP 3: Make an actual step */

	// 3) a. Compute Jacobian based on current angles
	Jacobian j(m_bob->angles, m_bob->L1, m_bob->L2, m_bob->L3, m_bob->z);

	// 3) b. Find BETA based on step
	BetaSolver beta(j, Eigen::Vector3d{ step[0], step[1], step[2] });

	// 3) c. calculate dt Thetas based on Jt * beta
	dtThetas = j.jacobian.transpose() * beta.beta;

	// 3) d. update joint angles
	updateAngles(dtThetas);

	/****************************************************************/

	/*STEP 4: recalculate endEffector*/
	EndEffectorWorldCoord t(m_bob->angles, m_bob->L1, m_bob->L2, m_bob->L3, m_bob->z);
	P_endEffector = t.matrixTransform * Eigen::Vector4d{ 0.0, 0.0, 0.0, 1 };
	

	converge(100);
	
	
}

// The following function updates what p_target should be based on what fraction of max_time we're at and therefore what 
// precentage of spline we are at.
void BobDraws::updateP_target(float param)
{
	
	/* STEP 1: convert input parameter to t (percantage of spline length)*/
	float fullLength = drawingPath->getFullLength();
	float distanceTravelled = (param / max_animation_time) * fullLength;

	/* STEP 2: Calculate position based on P(u(s(t)))*/
	LookUpTableEntry tempEntry = LookUpTableEntry();
	tempEntry.arcLength = distanceTravelled;
	double u = drawingPath->getU(tempEntry);

	/* STEP 2. c) get P_target based on U*/
	// create a temp point
	ControlPoint point = ControlPoint();
	point = drawingPath->getPointAtU(u);

	// Populate return point
	P_target << point.point.x, point.point.y, point.point.z, 1;

}

void BobDraws::print_vals_for_testing(Eigen::Vector4d step)
{
	glm::vec3 step_print = { step[0], step[1], step[2] };
	glm::vec3 p_target_print = { P_target[0], P_target[1], P_target[2] };
	glm::vec3 p_end_effector_print = { P_endEffector[0], P_endEffector[1], P_endEffector[2] };
	glm::vec4 error_print = { Error[0], Error[1], Error[2], Error[3] };
	
	animTcl::OutputMessage("print delta Thetas: %f %f %f %f %f %f %f", dtThetas[0], dtThetas[1], dtThetas[2], dtThetas[3], dtThetas[4], dtThetas[5], dtThetas[6]);
	animTcl::OutputMessage("print angles: %f %f %f %f %f %f %f", m_bob->angles.theta1, m_bob->angles.theta2, m_bob->angles.theta3, m_bob->angles.theta4, m_bob->angles.theta5, m_bob->angles.theta6, m_bob->angles.theta7);
	animTcl::OutputMessage("current step is: %f %f %f", step_print.x, step_print.y, step_print.z);
	animTcl::OutputMessage("current P_target is: %f %f %f", p_target_print.x, p_target_print.y, p_target_print.z);
	animTcl::OutputMessage("current P_endEffector is: %f %f %f", p_end_effector_print.x, p_end_effector_print.y, p_end_effector_print.z);
	animTcl::OutputMessage("current error vector is: %f %f %f %f", error_print.x, error_print.y, error_print.z, error_print.w);
	animTcl::OutputMessage("current error size is: %f\n\n", Error.norm());
	animTcl::OutputMessage("");
	animTcl::OutputMessage("");
}

void BobDraws::updateAngles(Eigen::VectorXd newThetas)
{
	// UPDATE THETAS
	m_bob->angles.theta1 = m_bob->angles.theta1 + newThetas[0];
	m_bob->angles.theta2 = m_bob->angles.theta2 + newThetas[1];
	m_bob->angles.theta3 = m_bob->angles.theta3 + newThetas[2];
	m_bob->angles.theta4 = m_bob->angles.theta4 + newThetas[3];
	m_bob->angles.theta5 = m_bob->angles.theta5 + newThetas[4];
	m_bob->angles.theta6 = m_bob->angles.theta6 + newThetas[5];
	m_bob->angles.theta7 = m_bob->angles.theta7 + newThetas[6];
}

void BobDraws::initializePs() {

	// Initialize resting position in degrees
	m_bob->angles = rAngles{ 10.0 * 3.141592653589 / 180.0, 10.0 * 3.141592653589 / 180.0, 10.0 * 3.141592653589 / 180.0, 10.0 * 3.141592653589 / 180.0, 10.0 * 3.141592653589 / 180.0, 10.0 * 3.141592653589 / 180.0, 10.0 * 3.141592653589 / 180.0 };
	m_bob->leftAngles = rAngles{ 10.0 , -10.0, -15.0, 5.0, -25.0, -10.0, -10.0};
	
	
	// Create an initial eigen point for end effector in world coordinates	
	P_endEffector << 0.0, 0.0, 0.0, 1.0; 

	// Get the series of transformations to multiply end effector by to get its position in world coordinates
	EndEffectorWorldCoord transform(m_bob->angles, m_bob->L1, m_bob->L2, m_bob->L3, m_bob->z);

	// now end Effector represents Pinitial in world coordinates. In the beginning P_endEffector == endEffector
	P_endEffector = transform.matrixTransform * P_endEffector;
	
	// P_target is also in world coordinates representing the beginning of the spline
	P_target << drawingPath->controlPoints[0].point.x, drawingPath->controlPoints[0].point.y, drawingPath->controlPoints[0].point.z, 1.0;
	

	// SET START AND END TO BE START AND END OF SPLINE
	start = P_endEffector;
	end << drawingPath->controlPoints[0].point.x, drawingPath->controlPoints[0].point.y, drawingPath->controlPoints[0].point.z, 1.0;
	//end << drawingPath->controlPoints[drawingPath->numKnots-1].point.x, drawingPath->controlPoints[drawingPath->numKnots - 1].point.y, drawingPath->controlPoints[drawingPath->numKnots - 1].point.z, 1.0;

	// save resting position
	resting_position = P_endEffector;

	///////////////////// VARS FOR TESTING /////////
	m_bob->temp_end_eff = { P_endEffector[0], P_endEffector[1], P_endEffector[2] };
	m_bob->target_point = glm::vec3{ P_target[0], P_target[1], P_target[2] };
	
	/////////////////////////////////////////////

	
}

int BobDraws::command(int argc, myCONST_SPEC char** argv)
{
	if (argc < 1)
	{
		//animTcl::OutputMessage("system: wrong number of params.");
		return TCL_ERROR;
	}
	else if (strcmp(argv[0], "read") == 0)
	{ // simulator iksim read spline.txt
		//animTcl::OutputMessage("within read argc is, %d, argv.size is, %d", argc, sizeof(argv));
		if (argc == 2) {
			// call HermiteSpline to load the file argv[3]
			drawingPath->load(argv[1]);
			// get rid of resting position
			m_bob->restPosition = false;
			m_bob->readyPosition = true;
			// Initialize P
			initializePs();
		}
		else {
			// Wrong number of arguments
			//animTcl::OutputMessage("Wrong number of arguments");
			return TCL_ERROR;
		}
	}
	glutPostRedisplay();
	return TCL_OK;
}