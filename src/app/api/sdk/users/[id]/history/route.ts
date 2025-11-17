import { withAuth } from '@/lib/sdk/middleware/auth';
import { errorHandler } from '@/lib/sdk/middleware/errorHandler';
import { UserProfileService } from '@/lib/sdk/modules/rrhh/UserProfileService';

export const GET = withAuth(async (req, { params }) => {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const userService = new UserProfileService();
    const history = await userService.getUserChangeHistory(params.id, limit);

    return new Response(
      JSON.stringify({
        success: true,
        data: history,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return errorHandler(error);
  }
});
