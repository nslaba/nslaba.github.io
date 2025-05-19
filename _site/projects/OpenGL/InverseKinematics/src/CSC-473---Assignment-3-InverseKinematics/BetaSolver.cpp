#include "BetaSolver.h"

void printVectorBeta(Eigen::Vector3d beta)
{
	animTcl::OutputMessage("\nBeta by row: ");
	for (int i = 0; i < 3; i++) {
		animTcl::OutputMessage("%f \n", beta.row(i)[0]);
	}

	animTcl::OutputMessage("\n\n");
}
BetaSolver::BetaSolver(Jacobian& j, Eigen::Vector3d& dtX) 
{
	betaSolver(j, dtX);
	//printVectorBeta(beta);
}

// Solve for beta
void BetaSolver::betaSolver(Jacobian& j, Eigen::Vector3d dtX)
{



	// Make a j jt matrix (j multiplied by its transpose)
	Eigen::Matrix3d jjt = j.jacobian * j.jacobian.transpose();
	
	Eigen::JacobiSVD<Eigen::MatrixXd> svd(jjt, Eigen::ComputeThinU | Eigen::ComputeThinV);
	Eigen::Vector3d b = svd.solve(dtX);


	//// Use the eigen properties and functions to solve for beta with Lower Upper triangular
	//Eigen::PartialPivLU<Eigen::Matrix3d> lu(jjt);
	//Eigen::Vector3d b = lu.solve(dtX);
	beta.col(0) << b[0], b[1], b[2];
}



