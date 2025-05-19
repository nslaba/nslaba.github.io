#pragma once

#include "Jacobian.h"
#include "BaseSystem.h"
#include <shared/defs.h>
#include <util/util.h>
#include "animTcl.h"
#include <GLmodel/GLmodel.h>
#include "Particle.h"
#include "shared/opengl.h"
#include <vector>
#include <glm/glm.hpp>
#include "rAngles.h"


class BetaSolver
{
public:
	BetaSolver() = default;
	BetaSolver(Jacobian& j, Eigen::Vector3d& dtX);

	Eigen::Vector3d beta;

	// Solve for beta
	void betaSolver(Jacobian& j, Eigen::Vector3d dtX);

protected:
	


};

