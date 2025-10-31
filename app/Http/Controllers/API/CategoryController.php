<?php

namespace App\Http\Controllers\API;

use App\Enums\CategoryTypeConstant;
use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    protected $user;

    public function __construct(
        protected Category $category
    ) {
        $this->user = Auth::user();
    }

    public function types()
    {
        $categoryTypes = CategoryTypeConstant::toArray();

        return MessageFixer::success("Category types", $categoryTypes);
    }

    public function index(Request $request)
    {
        $query = $this->category
            ->where('user_id', $this->user->id)
            ->when(
                $request->filled('type') && $request->get('type') != '-1',
                fn($q) => $q->where('type', $request->get('type'))
            )
            ->when(
                $request->filled('search'),
                fn($q) => $q->where('name', 'like', '%' . $request->get('search') . '%')
            );

        $transform = fn($category) => tap($category, function ($c) {
            $c->type_desc = CategoryTypeConstant::getMessage($c->type);
        });

        if ($request->boolean('paginate')) {
            $categories = $query->paginate($request->integer('perPage', 10));
            $categories->getCollection()->transform($transform);

            return MessageFixer::paginate('Categories', $categories);
        }

        $categories = $query->get()->map($transform);
        return MessageFixer::success('Categories', $categories);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:3|max:100',
            'type' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), isList: true);
        }

        DB::beginTransaction();

        try {
            $this->category->create([
                'name' => $request->name,
                'type' => $request->type,
                'user_id' => $this->user->id
            ]);

            DB::commit();
            return MessageFixer::success("Category created successfully");
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }

    public function show($id)
    {
        $category = $this->category->find($id);
        if (!$category) {
            return MessageFixer::notFound('Category not found');
        }

        return MessageFixer::success('Category', $category);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:3|max:100',
            'type' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), isList: true);
        }

        $category = $this->category->find($id);
        if (!$category) {
            return MessageFixer::notFound('Category not found');
        }

        DB::beginTransaction();

        try {
            $category->update([
                'name' => $request->name,
                'type' => $request->type
            ]);

            DB::commit();
            return MessageFixer::success("Category updated successfully");
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }

    public function destroy($id)
    {
        $category = $this->category->find($id);
        if (!$category) {
            return MessageFixer::error('Category not found');
        }

        DB::beginTransaction();

        try {
            $category->delete();

            DB::commit();
            return MessageFixer::success("Category deleted successfully");
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }
}
